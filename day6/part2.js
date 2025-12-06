var fs = require('fs');

var input = fs.readFileSync('./input.txt', 'utf8').split('\r\n').map(l => l.split(''));

var answer = 0;

for(var x = 0; x < input[0].length; x++) {
    var operator = input[input.length-1][x];

    if (operator != ' ') {
        var numbers = [];
        var valid = true;
        for (var xx = x; valid; xx++) {
            var ns = '';
            for(var y = 0; y < input.length-1; y++) {
                if (input[y][xx] != ' ' && input[y][xx] != undefined) {
                    ns += input[y][xx];
                }
            }
            if (ns == '') {
                valid = false;
            } else {
                numbers.push(parseInt(ns));
            }
        }

        numbers = numbers.filter(n => n > 0);
        
        if (operator == '+') {
            answer += numbers.reduce((a, c) => a + c, 0);
        } else {
            answer += numbers.reduce((a, c) => a * c, 1);
        }
    }
}

console.log(answer);