var fs = require('fs');

var input = fs.readFileSync('./input.txt', 'utf8').split(',');

var invalidSum = 0;

input.forEach(i => {
    var res = /(\d+)\-(\d+)/.exec(i);
    var min = parseInt(res[1]);
    var max = parseInt(res[2]);

    for(var n = min; n <= max; n++) {
        var str = n+'';
        if ((str.length / 2) == Math.floor(str.length/2)) {
            var firstHalf = str.substring(0, str.length/2);
            var secondHalf = str.substring(str.length/2);
            if (firstHalf == secondHalf) {
                invalidSum += n;
            }
        }
    }

})

console.log(invalidSum);