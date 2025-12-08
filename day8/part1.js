var fs = require('fs');

var input = fs.readFileSync('./input.txt', 'utf8').split('\r\n').map(l => l.split(',').map(n => parseInt(n)));

var connections = {};

var distances = [];

function dist(j1, j2) {
    var dx = j1[0] - j2[0];
    var dy = j1[1] - j2[1];
    var dz = j1[2] - j2[2];
    return Math.sqrt(dx*dx + dy*dy + dz*dz);
}

input.forEach((i, n) => {
    input.forEach((ii, nn) => {
        if (nn > n) {
            distances.push({
                j1: n,
                j2: nn,
                d: dist(i, ii)
            });
        }
    })
});

distances.sort((a, b) => {
    return a.d - b.d;
});


var num = (input.length < 50) ? 10 : 1000;
for(var j = 0; j < input.length; j++) {
    connections[j] = { parent: j, size: 1 };
}

function root(id) {
    var o = connections[id];
    if (id != o.parent) {
        var top = root(o.parent);
        o.parent = top.parent;
        return top;
    }
    return o;
}

function link(a, b) {
    var firstObj = root(a);
    var secondObj = root(b);

    if (firstObj.parent != secondObj.parent) {
        if (firstObj.size > secondObj.size) {
            firstObj.size += secondObj.size;
            secondObj.parent = firstObj.parent;
        } else {
            secondObj.size += firstObj.size;
            firstObj.parent = secondObj.parent;
        }
    }
}


for(var d = 0; d < num; d++) {
    var c1 = distances[d].j1;
    var c2 = distances[d].j2;

    link(c1, c2);
}

var sorted = Object.values(connections).sort((a, b) => b.size - a.size);
var largest = sorted.slice(0, 3);
var multiplied = largest.reduce((a, c) => { return a * c.size; }, 1);

console.log(multiplied);