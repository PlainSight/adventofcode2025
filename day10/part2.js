var fs = require('fs');

var input = fs.readFileSync('./input.txt', 'utf8').split('\r\n');

var problems = input.map(i => {
    var parts = /\[(.+)\](.+)\{(.+)\}/.exec(i);
    var buttonWirings = parts[2].split(/[\s+\(\)]/).filter(n => n != '');
    var joltageReqs = parts[3].split(',').map(n => parseInt(n));
    return {
        wirings: buttonWirings.map(n => n.split(',').map(x => parseInt(x))),
        joltages: joltageReqs,
        best: Number.MAX_SAFE_INTEGER,
        cache: {}
    }
});

// need to do some kind of n dimensional path finding or something 
// actually maybe a big simultaneous equation

function value(i, pushes) {
    return problems[i].joltages.map((_, j) => {
        return problems[i].wirings.reduce((a, w, wi) => a + (w.some(ww => ww == j) ? (pushes[wi] || 0) : 0), 0);
    });
}

function distance(i, pushes) {
    var val = value(i, pushes);
    return val.reduce((a, c, ci) => {
        return a + (c <= problems[i].joltages[ci] ? problems[i].joltages[ci] - c : Number.MAX_SAFE_INTEGER);
    }, 0);
}

function pushCount(pushes) {
    return pushes.reduce((a, c) => a+c, 0);
}

function clone(p) {
    return p.map(n => n);
}

function search(i) {
    var seen = {};

    function key(n) {
        return n.join(',');
    }

    var heap = [{
        v: distance(i, []),
        pushes: []
    }];

    var saw = 0;

    var solution = Number.MAX_SAFE_INTEGER;

    while (heap.length) {
        saw++;
        var top = heap.pop();

        if (top.v == 0) {
            //done

            var score = pushCount(top.pushes);
            if (score < solution) {
                console.log('FOUND', top, score);
                solution = score;
            }
        }
        
        if (top.pushes.length == problems[i].wirings.length) {
            continue;
        }

        var lastValid = true;
        var count = 0;
        while(lastValid) {
            var newPushes = clone(top.pushes);
            newPushes.push(count);
            count++;

            var dist = distance(i, newPushes);
            var pc = pushCount(newPushes);

            var k = key(value(i, newPushes));

            if (dist <= top.v && ((!seen[k]) || pc <= seen[k])) {
                heap.push({
                    v: dist,
                    pushes: newPushes
                });
                seen[k] = pc;
            } else {
                lastValid = false;
            }
        }
    }

    return solution;
}

// function leastPushes(index, pushes, index) {
//     var prob = problems[index];

//     if (pushes >= prob.best || prob.cache[state] < pushes) {
//         return Number.MAX_SAFE_INTEGER;
//     } else {
//         prob.cache[state] = pushes;
//     }

//     if (check(prob.lights, state)) {
//         prob.cache[state] = pushes;
//         if (pushes < prob.best) {
//             prob.best = pushes;
//         }
//         return pushes;
//     }

//     var low = Number.MAX_SAFE_INTEGER;

//     prob.wirings.forEach((w, wi) => {
//         if (wi != lastButton) {
//             var newState = act(state, w);
//             var amount = leastPushes(index, newState, wi, pushes+1);
//             if (amount < low) {
//                 low = amount;
//             }
//         }
//     });

//     return low;
// };

var total = 0;

for(var i = 0; i < problems.length; i++) {
    total += search(i);
    console.log(i, total);
}

console.log(total);