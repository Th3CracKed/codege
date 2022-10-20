
import * as ps from 'ps-node';

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