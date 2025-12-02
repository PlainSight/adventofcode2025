var fs = require('fs');

var input = fs.readFileSync('./input.txt', 'utf8').split(',');

var invalidSum = 0;

input.forEach(i => {
    var res = /(\d+)\-(\d+)/.exec(i);
    var min = parseInt(res[1]);
    var max = parseInt(res[2]);

    for(var n = min; n <= max; n++) {
        var str = n+'';

    outer:    for(var inc = Math.floor(str.length / 2); inc > 0; inc--) {
            if ((str.length / inc) == Math.floor(str.length/inc)) {
                var proto = str.substring(0, inc);
                var good = true;
                for(var j = inc; j < str.length; j += inc) {
                    if (proto != str.substring(j, j+inc)) {
                        good = false;
                    }
                }
                if (good) {
                    invalidSum += n;
                    break outer;
                }
            }
        }
    }

})

console.log(invalidSum);