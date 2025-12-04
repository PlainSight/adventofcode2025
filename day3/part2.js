var fs = require('fs');

var input = fs.readFileSync('./input.txt', 'utf8').split('\r\n').map(n => n.split('').map(x => parseInt(x)));

var total = 0;

function findMax(bi, b, pos, left) {
    if (left == 0) {
        return 0;
    }
    var bestScore = 0;
    var index = pos;
    for(var i = pos; i <= b.length-left; i++) {
        var score = b[i];
        if (score > bestScore) {
            bestScore = score;
            index = i;
        }
    }
    bestScore *= Math.pow(10, left-1);
    bestScore += findMax(bi, b, index+1, left-1)
    return bestScore;
}

input.forEach((b, bi) => {
    var s = findMax(bi, b, 0, 12);
    total += s
})

console.log(total);