// temp solution : 
// listen to port 9229 


// attach chrome debugger protocol to the correct port (temp 9229)

// when user record; add breakpoints to source code

// when user stop record

	// generate a map of decoration 
	// decorate current workspace files 



// support typescript projects (sourceMap)

// (optional) generate line by line code that when clicked on a line open the according file/line with correct debug info 
// (optional) data debug view matching the line by line view (scope change + side effects)



// find list of node process
-- that have a path matching current workspace 
pwdx <PID>
lsof -p <PID> | grep cwd

    // propose to record 
    // if inspect is already running and port is known
    // propose to record with a 9229 port if available
        // go debug mode on running nodejs process
	        // node -e "process._debugProcess(PID)"
	        // kill -USR1 <node-pid>
    // say to user to run nodejs process on different debugging ports because entry debugging port is used or allow my extension to change this port to autoAttach?
    
// get debug port of node process



// fetch 9229
// SIGUSR1 process 
// fetch 9229
// if still not defined
    // Bruteforce to find debug process : port is always between 1024 to 65535 so fetch and check url if match process program

// change port 

// inspector.close();
// inspector.open(0)

// process swap listen to port 9229 change it to other process then go to selected user process SIGUSR1 than change it to other port and go back to first process and change back to 9229


// UX : Coverage color is darker depending on how many line of code 



slider with dot to indicate tracked event


Focus mode (or zoom ?)


You can debug an already running program using the local mode type configuration. The Go extension will start dlv dap and configure it to attach to the specified process. Users can select the process to debug with one of the following options:
    Specifying the numeric process id (PID) with the processId attribute.
    Specifying the target program name in the processId attribute. If there are multiple processes matching the specified program name, the extension will show the list of matching processes at the start of the debug session.
    Specifying 0 in the processId attribute and selecting the process from the drop-down menu at the start of the debug session.

dlv dap

pid or program name


vscode > go extension > dlv


https://rr-project.org/

https://github.com/rr-debugger/rr/wiki/Using-rr-in-an-IDE#setting-up-visual-studio-code


https://github.com/go-delve/delve/blob/master/Documentation/usage/dlv_replay.md

https://github.com/microsoft/vscode-node-debug/blob/main/src/node/extension/autoAttach.ts



https://github.com/ktock/vscode-buildg


https://github.com/shelljs/shelljs



function calls one after the other view (by stack)

first level is the root function call stack 



# how to test js-debug
 download vscode source code
 remove extension from products.json
 compile vscode

dlv attach PID --headless --log-output

 node tcp_connect.js SERVER_PORT

