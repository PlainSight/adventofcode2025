var fs = require('fs');

var input = fs.readFileSync('./input.txt', 'utf8').split('\r\n\r\n');

var arrangements = [];
var shapes = [];

input.forEach((section, i) => {
    if (i == input.length-1) {
        var subsection = section.split('\r\n');

        subsection.forEach(ss => {
            // arrangements
            var parts = ss.split(': ');
            var dimensions = parts[0].split('x').map(n => parseInt(n));
            var elements = parts[1].split(' ').map(n => parseInt(n));

            arrangements.push({
                dim: dimensions,
                elements: elements
            });
        });
    } else {
        // shape
        var shape = section.split('\r\n').slice(1).map(n => n.split(''));

        var pixels = 0;
        shape.forEach(y => {
            y.forEach(x => {
                if (x == '#') {
                    pixels++;
                }
            });
        });
        shapes.push(pixels);
    }
});

var sum = 0;
var tsum = 0;

arrangements.forEach(a => {
    var totalPixels = a.elements.reduce((a, e, ei) => {
        return a + (e * shapes[ei]);
    }, 0);
    console.log(a, totalPixels);
    if (totalPixels <= a.dim[0] * a.dim[1]) {
        sum++;
    }

    var totalSlots = Math.floor(a.dim[0] / 3)*Math.floor(a.dim[1] / 3);
    var totalPieces = a.elements.reduce((a, c) => a + c, 0);
    if (totalPieces < totalSlots) {
        tsum++;
    }
});

console.log(sum, tsum);