var fs = require('fs');

var input = fs.readFileSync('./input.txt', 'utf8').split('\r\n');

var problems = input.map(i => {
    var parts = /\[(.+)\](.+)\{(.+)\}/.exec(i);
    var buttonWirings = parts[2].split(/[\s+\(\)]/).filter(n => n != '');
    var joltageReqs = parts[3].split(',').map(n => parseInt(n));
    return {
        wirings: buttonWirings.map(n => n.split(',').map(x => parseInt(x))),
        joltages: joltageReqs
    }
});

problems.forEach(p => {
    p.related = p.joltages.map((j, ji) => {
        return {
            relatedButtons: p.wirings.map((w, wi) => w.includes(ji) ? wi : null).filter(x => x != null),
            max: j
        }
    });

    // for each value we can calculate the maximum number of presses for a set of buttons
});

function shrink(r1, rs, cap) {
    // rs is the other ranges
    // shrink r1 contingent on r2 and cap

    var r2 = [
        rs.reduce((a, c) => a + c[0], 0), 
        Math.min(cap, rs.reduce((a, c) => a + c[1], 0))
    ];

    // r1's min increases by cap - r2's max (but not beyond it's existing max)
    // r1's max reduces by r2's min
    var ret = [
        Math.max(r1[0], Math.max(0, cap-r2[1])),
        Math.min(r1[1], Math.max(0, cap-r2[0]))
    ];

    // if (ret[0] > ret[1]) {
    //     console.log('AH', ret, r1, rs, r2, cap);
    // }

    var changed = r1[0] != ret[0] || r1[1] != ret[1];

    return [ret, changed];
}

//console.log(shrink([0, 5], [], 5));

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

// function search(i, buttonsPushed) {
//     var formulaToEvaluate = problems[i].related;

//     // shrink buttons

//     formulaToEvaluate = formulaToEvaluate.map(f => {
//         var v = 0;
//         var pushes = 0;
//         var mutable = [];
//         f.relatedButtons.forEach(b => {
//             if (buttonsPushed[b] == -1) {
//                 v++;
//                 mutable.push(b);
//             } else {
//                 pushes += buttonsPushed[b];
//             }
//         });
//         return {
//             f: f,
//             mutable: mutable,
//             v: v,
//             m: f.max-pushes
//         };
//     });

//     if (formulaToEvaluate.some(fe => fe.m < 0)) {
//         return -1;
//     }

//     formulaToEvaluate = formulaToEvaluate.filter(fe => fe.mutable.length > 0);


//     if (formulaToEvaluate.length == 0) {
//         if (distance(i, buttonsPushed) == 0) {
//             var pushes = buttonsPushed.reduce((a, c) => a + c, 0);
//             console.log('found', buttonsPushed, pushes)
//             return pushes;
//         }

//         return -1;
//     }

//     formulaToEvaluate = formulaToEvaluate.sort((f1, f2) => {
//         if (f1.v == f2.v) {
//             return f1.m - f2.m;
//         }
//         return f1.v - f2.v;
//     });

//     var bestFormula = formulaToEvaluate[0];


//     var buttonsToTest = bestFormula.mutable;

//     var bestResult = Number.MAX_SAFE_INTEGER;

//     for(var p = 0; p <= bestFormula.m; p++) {
//         var newButtons = buttonsPushed.map(n => n);
//         newButtons[buttonsToTest[0]] = p;
//         var result = search(i, newButtons);
//         if (result != -1 && result < bestResult) {
//             bestResult = result;
//         }
//     }

//     return bestResult;
// }

function search(i, buttons, bi) {
    var newButtons = calculateRanges(i, buttons);

    var minPushes = buttons.reduce((a, c) => a + c[0], 0);

    if (newButtons.every(b => b[0] == b[1]) || bi >= buttons.length) {
        // found a solution or dead end
        if (distance(i, newButtons.map(n => n[0])) == 0) {
            return minPushes;
        } else {
            return Number.MAX_SAFE_INTEGER;
        }
    }

    do {
        bi++;
    }
    while (bi < newButtons.length && newButtons[bi][0] == newButtons[bi][1]);

    if (bi == newButtons.length || newButtons[bi][0] == newButtons[bi][1]) {
        // another terminal condition
        // found a solution or dead end
        if (distance(i, newButtons.map(n => n[0])) == 0) {
            return minPushes;
        } else {
            return Number.MAX_SAFE_INTEGER;
        }
    }

    var best = Number.MAX_SAFE_INTEGER;

    for(var j = newButtons[bi][0]; j <= newButtons[bi][1]; j++) {
        var mutatedButton = newButtons.map(x => x.map(xx => xx));
        mutatedButton[bi][0] = j;
        mutatedButton = calculateRanges(i, mutatedButton);
        if (mutatedButton.some(b => b[0] > b[1])) {
            continue;
        }

        var res = search(i, mutatedButton, bi+1);
        if (res < best) {
            best = res;
        }
    }

    return best;
}

var total = 0;

function calculateRanges(i, r) {
    var ranges = r.map(m => m.map(n => n));
    var lastHadChanges = true;

    while(lastHadChanges) {
        lastHadChanges = false;
        problems[i].related.forEach(formula => {
            formula.relatedButtons.forEach((b) => {
                var nonSelectedButtons = formula.relatedButtons.filter(bb => bb != b);
                [ranges[b], changed] = shrink(ranges[b], ranges.filter((_, ri) => nonSelectedButtons.includes(ri)), formula.max);
                if (changed) {
                    lastHadChanges = changed;
                }
            })
        })
    }
    return ranges;
}

for(var i = 0; i < problems.length; i++) {
    var buttons = calculateRanges(i, problems[i].wirings.map(() => [0, Number.MAX_SAFE_INTEGER]));
    console.log('ranges', buttons);
    console.log('toCheck', buttons.reduce((a, c) => a * ((c[1]-c[0])+1), 1));

    var v = search(i, buttons, 0);
    console.log(i, v);
    total += v;
    return;
}

console.log(total);