var fs = require('fs');

var input = fs.readFileSync('./input.txt', 'utf8').split('\r\n').map(n => n.split('').map(x => parseInt(x)));

var total = 0;

input.forEach(b => {
    var m = 0;
    for(var i = 0; i < b.length-1; i++) {
        for(var j = i+1; j < b.length; j++) {
            if (10*b[i] + b[j] > m) {
                m = 10*b[i] + b[j];
            }
        }
    }
    total += m;
})

console.log(total);