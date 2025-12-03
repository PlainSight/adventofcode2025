var fs = require('fs');

var input = fs.readFileSync('./input.txt', 'utf8').split('\r\n').map(n => n.split('').map(x => parseInt(x)));

var total = 0;

var cache = {};

function findMax(bi, b, pos, left) {
    if (cache[bi+','+pos+','+left]) {
        return cache[bi+','+pos+','+left];
    }
    if (left == 0) {
        cache[bi+','+pos+','+left] = 0;
        return 0;
    }
    var bestScore = 0;
    for(var i = pos; i <= b.length-left; i++) {
        var score = (Math.pow(10, left-1) * b[i]) + findMax(bi, b, i+1, left-1);
        if (score > bestScore) {
            bestScore = score;
        }
    }
    cache[bi+','+pos+','+left] = bestScore;
    return bestScore;
}

input.forEach((b, bi) => {
    var s = findMax(bi, b, 0, 12);
    total += s
})

console.log(total);