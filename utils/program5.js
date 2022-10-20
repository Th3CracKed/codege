const a = 5;

const keypress = async () => {
    process.stdin.setRawMode(true)
    return new Promise(resolve => process.stdin.once('data', () => {
        if (process.stdin.isTTY) {
            process.stdin.setRawMode(false);
        }
        resolve()
    }))
}

(async function () {
    console.log(process.pid);
    await keypress();
    console.log('hi');
    const userInput = 5;
    if (userInput <= 5) {
        console.log('run logic 1');
    } else {
        console.log('run logic 2');
    }
    console.log('done');
}())

/*
when I'm on line 24 (eg : 23 in debugger) deduce that r value came from fn1 -> fn2 -> fn3 with 'start' as input
starting from the function call snapshot of line 23

looping backwards search by the same value stored in the variable for functions returns with same value ? (will this work try to find a counter example)

function fn1() {
    const fnResult = fn2();
    return fnResult + ' pff';
}

function fn2() {
    return 'trr';
}

let result = fn1();


result = result.length < 4 ? result : 5;


*/