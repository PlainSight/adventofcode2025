var fs = require('fs');

var input = fs.readFileSync('./input.txt', 'utf8').split('\r\n\r\n');

var fresh = input[0].split('\r\n').map(n => {
    var range = /(\d+)\-(\d+)/.exec(n);
    return [parseInt(range[1]), parseInt(range[2])];
});

var ranges = [];

function rangeInRange(r1, r2) {
    if (!(r1[1] < r2[0] || r1[0] > r2[1])) {
        return true;
    }
    return false;
}

function appendRange(range) {
    for(var i = 0; i < ranges.length; i++) {
        var r = ranges[i];
        if (rangeInRange(range, r)) {
            ranges.splice(i, 1);
            var min = Math.min(range[0], r[0]);
            var max = Math.max(range[1], r[1]);
            appendRange([min, max]);
            return;
        }
    }
    ranges.push(range);
}

var max = 0;

fresh.forEach(f => {
    if (f[1] > max) {
        max = f[1];
    }
    appendRange(f);
});

console.log(ranges.reduce((a, c) => {
    return a + ((c[1] - c[0]) + 1);
}, 0));