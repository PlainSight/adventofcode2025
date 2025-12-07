var fs = require('fs');

var input = fs.readFileSync('./input.txt', 'utf8').split('\r\n').map(n => n.split(''));

function increment(x, y, amount) {
    if (amount == 'S') {
        amount = 1;
    }
    if (input[y][x] == '.') {
        input[y][x] = amount;
    } else {
        input[y][x] += amount;
    }
}

for(var y = 1; y < input.length; y++) {
    for (var x = 0; x < input[0].length; x++) {
        if (input[y-1][x] != '.' && input[y-1][x] != '^') {
            if (input[y][x] == '^') {
                increment(x-1, y, input[y-1][x]);
                increment(x+1, y, input[y-1][x])
            } else {
                increment(x, y, input[y-1][x]);
            }
        }
    }
}

var sum = input[input.length-1].reduce((a, c) => {
    if (c != '.' && c != '^') {
        return a + c;
    }
    return a;
}, 0);

console.log(sum);