var fs = require('fs');

var input = fs.readFileSync('./input.txt', 'utf8').split('\r\n').map(n => n.split(',').map(x => parseInt(x)));

var largestArea = 0;

for(var i = 0; i < input.length-1; i++) {
    for(var j = i+1; j < input.length; j++) {
        var a = input[i];
        var b = input[j];

        var area = (Math.abs(a[0]-b[0])+1) * (Math.abs(a[1]-b[1])+1);

        if (area > largestArea) {
            largestArea = area;
        }
    }
}

console.log(largestArea);