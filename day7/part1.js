var fs = require('fs');

var input = fs.readFileSync('./input.txt', 'utf8').split('\r\n').map(n => n.split(''));

var count = 0;

for(var y = 1; y < input.length; y++) {
    for (var x = 0; x < input[0].length; x++) {
        if (input[y-1][x] == '|' || input[y-1][x] == 'S') {
            if (input[y][x] == '.') {
                input[y][x] = '|';
            } else {
                if (input[y][x] == '^') {
                    count++;
                    input[y][x-1] = '|';
                    input[y][x+1] = '|';
                }
            }
        }
    }
}

// console.log(input);


// for (var x = 0; x < input[0].length; x++) {
//     if (input[input.length-1][x] == '|') {
//         count++;
//     }
// }

console.log(count);