var fs = require('fs');

var input = fs.readFileSync('./input.txt', 'utf8').split('\r\n').map(l => l.split(/[\:\s]/).filter(n => n != ''));

var fromTo = {};

input.forEach(i => {
    fromTo[i[0]] = i.slice(1);
});

var heap = ['you'];

var visits = {};

while(heap.length) {
    var top = heap.pop();

    visits[top] = (visits[top] || 0) + 1;

    if (fromTo[top]) {
        fromTo[top].forEach(t => {
            heap.push(t);
        });
    }
}

console.log(visits['out']);