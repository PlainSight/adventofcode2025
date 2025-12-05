var fs = require('fs');

var input = fs.readFileSync('./input.txt', 'utf8').split('\r\n\r\n');

var fresh = input[0].split('\r\n').map(n => {
    var range = /(\d+)\-(\d+)/.exec(n);
    return [parseInt(range[1]), parseInt(range[2])];
});
var ingredients = input[1].split('\r\n').map(n => parseInt(n));

console.log(fresh, ingredients);

var count = 0;

ingredients.forEach(i => {
    var isFresh = false;
    fresh.forEach(f => {
        if (i >= f[0] && i <= f[1]) {
            isFresh = true;
        } 
    });
    if (isFresh) {
        count++;
    }
});

console.log(count);