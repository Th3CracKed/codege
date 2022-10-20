
import Protocol from 'devtools-protocol';
import type ProtocolProxyApi from 'devtools-protocol/types/protocol-proxy-api';

export async function setBreakpoints(scriptSource: string, Debugger: ProtocolProxyApi.DebuggerApi, scriptId: string, url: string) {
    const numberOfLines = scriptSource.split('\n').length;
    const getPossibleBreakpointsResponse = await Debugger.getPossibleBreakpoints({
        "start": {
            scriptId,
            "lineNumber": 0,
            "columnNumber": 0
        },
        "end": {
            scriptId,
            "lineNumber": numberOfLines,
            "columnNumber": 0
        },
        "restrictToFunction": false
    });
    const breakpointsPromises = getPossibleBreakpointsResponse.locations.map(location => {
        const { lineNumber, columnNumber, scriptId, type } = location;
        return Debugger.setBreakpointByUrl({
            lineNumber,
            url,
            // "urlRegex": url,
            columnNumber,
            "condition": "",
        });
    });

    const breakpointsUrls = await Promise.all(breakpointsPromises);
    breakpointsUrls.forEach(breakpointUrl => console.log({ breakpointByUrlResponse: JSON.stringify(breakpointUrl) }));
    return breakpointsUrls.map(breakpointsUrl => breakpointsUrl.breakpointId);
}