const net = require('net');

const client = new net.Socket();
function getBytesSize(text) {
    return new TextEncoder('utf-8').encode(text).length;
}
const content = `{
    "seq": 1,
    "type": "request",
    "command": "setBreakpoints",
    "arguments": {
        "source": {
                "path": "/home/abdo/go_programs/hello.go"
        },
        "breakpoints": [
            {
                "line": 10
            }
        ],
        "sourceModified": false
    }
}`;
const rawData = `Content-Length: ${getBytesSize(content)}\r\n\r\n${content}`;
console.log({ rawData });
const port = process.argv[2];
client.connect(port, '127.0.0.1', function () {
    console.log('Connected');
    client.write(rawData);
});

client.on('data', function (data) {
    console.log('Received: ' + data);
    //    client.destroy(); // kill client after server's response
});

client.on('close', function () {
    console.log('Connection closed');
});