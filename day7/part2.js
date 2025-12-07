var fs = require('fs');

var input = fs.readFileSync('./input.txt', 'utf8').split('\r\n').map(n => n.split(''));

function increment(x, y, amount) {
    if (amount == 0) {
        return;
    }
    switch(input[y][x]) {
        case '^':
            increment(x-1, y, amount);
            increment(x+1, y, amount);
            return;
        case '.':
            input[y][x] = amount;
            return;
        default: 
            input[y][x] += amount;
            return;
    }
}

function getValue(x, y) {
    switch(input[y][x]) {
        case 'S':
            return 1;
        case '.':
            return 0;
        case '^':
            return 0;
        default:
            return input[y][x];
    }
}

for(var y = 1; y < input.length; y++) {
    for (var x = 0; x < input[0].length; x++) {
        increment(x, y, getValue(x, y-1));
    }
}

var sum = input[input.length-1].reduce((a, c) => {
    if (c != '.' && c != '^') {
        return a + c;
    }
    return a;
}, 0);

console.log(sum);