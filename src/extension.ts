import * as vscode from 'vscode';
import { ViewLoader } from './view/ViewLoader';
import { CommonMessage } from './view/messages/messageTypes';
import * as ps from 'ps-node';
import find = require('find-process');
import Protocol from 'devtools-protocol';
import { TestView } from './view/testView';
import * as CDP from 'chrome-remote-interface';
import { setBreakpoints } from './utility';
import * as fse from 'fs-extra';
import fetch from 'node-fetch';
var os = require('os');
var exec = require('child_process').exec;
import * as path from 'path';

const EXTENSION_NAME = 'codEge';

interface CacheObject {
  [programPath: string]: Protocol.Debugger.Location[]
}

export async function activate(context: vscode.ExtensionContext) {
  new TestView(context);
  vscode.commands.registerCommand('extension.startRecord', async () => {
    await start(context);
  });
  vscode.commands.registerCommand('extension.stopRecord', async () => {
    await stop(context);
  });

  vscode.window.onDidChangeActiveTextEditor(editor => {
    updateDecorations(context);
  }, null, context.subscriptions);
  // context.subscriptions.push(
  //   vscode.commands.registerCommand('webview.open', () => {
  //     ViewLoader.showWebview(context);
  //   }),

  //   vscode.commands.registerCommand('extension.sendMessage', () => {
  //     vscode.window
  //       .showInputBox({
  //         prompt: 'Send message to Webview',
  //       })
  //       .then(result => {
  //         result &&
  //           ViewLoader.postMessageToWebview<CommonMessage>({
  //             type: 'COMMON',
  //             payload: result,
  //           });
  //       });
  //   })
  // );
  // // A simple pid lookup 
  const currentPid = process.pid;
  ps.lookup({
    command: 'node',
    psargs: 'ux'
  }, function (err, resultList) {
    if (err) {
      throw new Error(err.message);
    }

    resultList.forEach(function (process) {
      if (process && currentPid !== process.pid) {
        console.log('PID: %s, COMMAND: %s, ARGUMENTS: %s', process.pid, process.command, process.arguments);
      }
    });
  });
  if (vscode.workspace.workspaceFolders !== undefined) {
    const wf = vscode.workspace.workspaceFolders[0].uri.path;
    const f = vscode.workspace.workspaceFolders[0].uri.fsPath;
    find(
      'name',
      /.*?\/auto_breakpoint.*/ // regex pattern
    ).then(processesList => console.log({ processesList }));
    find(
      'name',
      "auto_breakpoint" // regex pattern
    ).then(processesList2 => console.log({ processesList2 }));


    const message = `YOUR-EXTENSION: folder: ${wf} - ${f}`;

    vscode.window.showInformationMessage(message);
  } else {
    const message = "YOUR-EXTENSION: Working folder not found, open a folder an try again";

    vscode.window.showErrorMessage(message);
  }
}

export function deactivate() { }

let client: CDP.Client | undefined;
let breakpointsIds: string[] = [];

async function start(context: vscode.ExtensionContext) {
  const defaultData: CacheObject = {};
  const cacheName = `${EXTENSION_NAME}_cache`;
  const cacheObject = context.globalState.get(cacheName, defaultData);
  vscode.window.showInformationMessage('record started');
  const port = 9229;
  try {
    const response = await fetch(`http://localhost:${port}/json`);
    const data: any = await response.json();
    if (!data?.[0]?.title) {
      vscode.window.showErrorMessage('connection is undefined, something went wrong. Retrying...');
      return;
    }
    vscode.window.showInformationMessage(`program found`);
  } catch (err) {
    vscode.window.showErrorMessage(`No program is running with debug port ${port}`);
    return;
  }
  client = await CDP({
    port
  });
  const { Debugger } = client;
  Debugger.on('scriptParsed', async (params) => {
    console.log('scriptParsed event');
    const { scriptId, url } = params;
    console.log(scriptId, url);
    // const source = await Debugger.getScriptSource({ scriptId });
    // console.log(source);
    if (!url.startsWith('file://')) {
      console.log('this script is not part of the project');
      return;
    }
    const scriptSourceResponse = await Debugger.getScriptSource({
      "scriptId": scriptId
    });
    breakpointsIds = await setBreakpoints(scriptSourceResponse.scriptSource, Debugger, scriptId, url);
  });

  Debugger.on('paused', async (params) => {
    console.log('paused event');
    const { callFrames } = params;
    if (!callFrames.length) {
      console.log('callFrames is empty');
      return;
    }
    const [firstCallFrame, ...restOfCallFrames] = callFrames;
    const { location, url } = firstCallFrame;

    if (!url.startsWith('file://')) {
      console.log('this callFrame is not part of the project');
      return;
    }

    // detect executed path 
    if (location) {
      const storedLocations: Protocol.Debugger.Location[] = cacheObject[url] ?? [];
      storedLocations.push(location);
      const programPath = path.normalize(url.trim().toLowerCase()).replace('file:\\', '');
      cacheObject[programPath] = storedLocations;
      await context.globalState.update(cacheName, cacheObject);
    }
    Debugger.resume({ terminateOnResume: false });

  });
  console.log('Debugger enabling...');
  const enableResponse = await Debugger.enable({});
  console.log({ enableResponse });
  await Debugger.setBreakpointsActive({ active: true });
  console.log('Debugger enabled');
}

async function stop(context: vscode.ExtensionContext) {
  if (!client) {
    await vscode.window.showInformationMessage('record ended');
    return;
  }
  const { Debugger } = client;
  await Promise.all(breakpointsIds.map(breakpointId => Debugger.removeBreakpoint({ breakpointId })));
  await Debugger.disable();
  // TODO generate gutters
  updateDecorations(context);
  await vscode.window.showInformationMessage('record ended');
}

function updateDecorations(context: vscode.ExtensionContext) {
  const decorationType = vscode.window.createTextEditorDecorationType({
    isWholeLine: true,
    overviewRulerColor: 'green',
    backgroundColor: 'green'
  });
  let activeEditor = vscode.window.activeTextEditor;
  if (activeEditor === undefined) {
    return;
  }
  const currentlyOpenTabFilePath = activeEditor.document.fileName;
  const currentlyOpenTabFileName = path.normalize(currentlyOpenTabFilePath.trim().toLowerCase());
  const defaultData: CacheObject = {};
  const cacheName = `${EXTENSION_NAME}_cache`;
  const cacheObject = context.globalState.get(cacheName, defaultData);
  console.log({ cacheObject });
  const locations = cacheObject[currentlyOpenTabFileName];
  if (!locations) {
    return;
  }
  const text = activeEditor.document.getText();
  const lineSeparator = '\r\n';
  const lines = text.split(lineSeparator);
  const decorations: vscode.DecorationOptions[] = [];
  locations.forEach(location => {
    const { lineNumber, columnNumber } = location;
    let lineOffset = 0;
    for (let i = 0; i < lineNumber; i++) {
      lineOffset += lines[i].length + lineSeparator.length;
    }
    const startPos = activeEditor!.document.positionAt(lineOffset);
    const endPos = activeEditor!.document.positionAt(lineOffset + lines[lineNumber].length + lineSeparator.length);
    const decoration = { range: new vscode.Range(startPos, endPos), hoverMessage: 'executed path' };
    decorations.push(decoration);
  });
  activeEditor.setDecorations(decorationType, decorations);
}

// every \r\n +1 lineNumber

// offset every list length + column

// offset