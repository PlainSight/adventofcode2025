var fs = require('fs');

var input = fs.readFileSync('./input.txt', 'utf8').split('\r\n').map(n => n.split(',').map(x => parseInt(x)));

var largestArea = 0;

var verts = [];
var horis = [];

var inGrid = [] // [xmin][ymin];

function k(x, y) {
    return x + y * (verts.length);
}

for(var i = 0; i < input.length; i++) {
    var current = input[i];
    var next = input[(i+1)%input.length];

    var sx = current[0];
    var sy = current[1];
    var ex = next[0];
    var ey = next[1];

    if (sx == ex) {
        // vert
        verts.push({
            x: sx,
            y0: Math.min(sy, ey),
            y1: Math.max(sy, ey)
        })
    } else {
        // hori
        horis.push({
            y: sy,
            x0: Math.min(sx, ex),
            x1: Math.max(sx, ex)
        });
    }
}

verts.sort((a, b) => a.x - b.x);
horis.sort((a, b) => a.y - b.y);

var distinctVerts = Object.values(verts.reduce((a, c) => {
    a[c.x] = c.x;
    return a;
}, {})).sort((a, b) => a.x - b.x);

var distinctHoris = Object.values(horis.reduce((a, c) => {
    a[c.y] = c.y;
    return a;
}, {})).sort((a, b) => a.x - b.x);

var vertIndices = {};
var horiIndices = {};

distinctVerts.forEach((v, vi) => {
    vertIndices[v] = vi;
});

distinctHoris.forEach((h, hi) => {
    horiIndices[h] = hi;
});

verts.forEach(v => {
    distinctVerts.forEach((x, vi) => {
        if (v.x == x) {
            v.xi = vi;
        } 
    });
});

horis.forEach(h => {
    distinctHoris.forEach((y, hi) => {
        if (h.y == y ) {
            h.yi = hi;
        } 
    });
});

// scan left to right, top to bottom

for(var xi = 0; xi < distinctVerts.length; xi++) {
    var inBounds = false;
    var x = distinctVerts[xi];
    for(var yi = 0; yi < horis.length; yi++) {
        var h = horis[yi];
        if (x >= h.x0 && x < h.x1) {
            inBounds = !inBounds;
        }
        inGrid[k(xi, h.yi)] = inBounds;
    }
}

function checkInBounds(x0, y0, x1, y1) {
    var xi0 = Math.min(vertIndices[x0], vertIndices[x1]);
    var xi1 = Math.max(vertIndices[x0], vertIndices[x1]);

    var yi0 = Math.min(horiIndices[y0], horiIndices[y1]);
    var yi1 = Math.max(horiIndices[y0], horiIndices[y1]);

    var good = true;

    for(var x = xi0; x < xi1; x++) {
        for(var y = yi0; y < yi1; y++) {
            if(!inGrid[k(x, y)]) {
                good = false;
            }
        }
    }

    return good;
}

for(var i = 0; i < input.length-1; i++) {
    for(var j = i+1; j < input.length; j++) {
        var a = input[i];
        var b = input[j];

        var area = (Math.abs(a[0]-b[0])+1) * (Math.abs(a[1]-b[1])+1);

        if (checkInBounds(a[0], a[1], b[0], b[1]) && area > largestArea) {
            largestArea = area;
        }
    }
}

console.log(largestArea);

