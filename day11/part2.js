var fs = require('fs');

var input = fs.readFileSync('./input.txt', 'utf8').split('\r\n').map(l => l.split(/[\:\s]/).filter(n => n != ''));

var fromTo = {};

input.forEach(i => {
    fromTo[i[0]] = i.slice(1);
});

function findPaths(from, to) {
    var result = 0;

    var heap = [from];

    var visits = {};
    visits[from] = 1;

    while(heap.length) {
        var top = heap.pop();

        var visitCount = visits[top];

        delete visits[top];

        if (to == top) {
            result += visitCount;
        }

        if (fromTo[top]) {
            fromTo[top].forEach(t => {
                if (visits[t]) {
                    visits[t] += visitCount;
                } else {
                    visits[t] = visitCount;
                    heap.unshift(t);
                }
            });
        }
    }

    return result;
}

var SDFO = findPaths('svr', 'dac') * findPaths('dac', 'fft') * findPaths('fft', 'out');
var SFDO = findPaths('svr', 'fft') * findPaths('fft', 'dac') * findPaths('dac', 'out');

console.log(SDFO + SFDO);