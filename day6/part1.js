var fs = require('fs');

var input = fs.readFileSync('./input.txt', 'utf8').split('\r\n').map(n => n.split(/\s+/).filter(f => f != ''));

var answer = 0;

for(var x = 0; x < input[0].length; x++) {
    var operator = input[input.length-1][x];
    if (operator == '+') {
        var sum = 0;
        for(var y = 0; y < input.length-1; y++) {
            sum += parseInt(input[y][x]);
        }
        answer += sum;
    } else {
        var product = 1;
        for(var y = 0; y < input.length-1; y++) {
            product *= parseInt(input[y][x]);
        }
        answer += product;
    }
}

console.log(answer);