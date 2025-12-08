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

for(var j = 0; j < input.length; j++) {
    connections[j] = { parent: j, size: 1 };
}

function link(first, second) {
    var firstObj = connections[first];
    while (first != firstObj.parent) {
        first = firstObj.parent;
        firstObj = connections[first];
    }

    var secondObj = connections[second];
    while (second != secondObj.parent) {
        second = secondObj.parent;
        secondObj = connections[second];
    }

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

function findUnifyingSet() {
    var id = 0;
    var root = connections[0];

    while(id != root.parent) {
        id = root.parent;
        root = connections[root.parent];
    }

    return root;
}

var d = 0;

while (findUnifyingSet().size < input.length) {
    var c1 = distances[d].j1;
    var c2 = distances[d].j2;

    link(c1, c2);
    d++;
}

console.log(input[distances[d-1].j1][0] * input[distances[d-1].j2][0]);