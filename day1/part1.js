var fs = require('fs');

var input = fs.readFileSync('./input.txt', 'utf8').split('\r\n');

var pos = 50;
var times = 0;

input.forEach(i => {
    var bits = /([LR])(\d+)/.exec(i);
    var leftRight = bits[1];
    var amount = parseInt(bits[2]);

    if (leftRight == 'L') {
        pos -= amount;
    } else {
        pos += amount;
    }

    pos = (pos + 200) % 100;
    if (pos == 0) {
        times++;
    }
});

console.log(times);