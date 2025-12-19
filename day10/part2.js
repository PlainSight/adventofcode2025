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
        rs.reduce((a, c) => a + c[1], 0)
    ];

    // r1's min increases by cap - r2's max (but not beyond it's existing max)
    // r1's max reduces by r2's min
    var ret = [
        Math.max(r1[0], cap-r2[1]),
        Math.min(r1[1], cap-r2[0])
    ];

    var changed = r1[0] != ret[0] || r1[1] != ret[1];

    return [ret, changed];
}

function value(i, pushes) {
    return problems[i].joltages.map((_, j) => {
        return problems[i].wirings.reduce((a, w, wi) => a + (w.some(ww => ww == j) ? (pushes[wi][0] || 0) : 0), 0);
    });
}

var searches = 0;
var best = {};

function search(i, buttons) {
    var [newButtons, newButtonsValid] = calculateRanges(i, buttons);
    searches++;

    if (!newButtonsValid) {
        return Number.MAX_SAFE_INTEGER;
    }

    var maxSingleDistance = value(i, newButtons).map((v, vi) => problems[i].joltages[vi] - v).reduce((a, c) => a > c ? a : c, 0);

    var minPushes = newButtons.reduce((a, c) => a + c[0], 0);

    if ((minPushes + maxSingleDistance) >= (best[i] || Number.MAX_SAFE_INTEGER)) {
        return Number.MAX_SAFE_INTEGER;
    }

    if (newButtons.every(b => b[0] == b[1])) {
        // found a solution or dead end
        if (minPushes < (best[i] || Number.MAX_SAFE_INTEGER)) {
            best[i] = minPushes;
            console.log(i, minPushes);
        }
        return minPushes;
    }

    function sortingValue(bi) {
        if (newButtons[bi][1] - newButtons[bi][0] == 0) {
            return 0;
        }
        // return number of connections for button x button range
        return problems[i].wirings[bi].length * (newButtons[bi][1] - newButtons[bi][0]);
    }

    var bi = 0;
    var bestValue = -1;
    newButtons.forEach((nb, nbi) => {
        var val = sortingValue(nbi);
        if (val > bestValue) {
            bestValue = val;
            bi = nbi;
        }
    });

    var lowPoint = newButtons[bi][0];
    var highPoint = newButtons[bi][1];
    var midPointA = Math.floor((lowPoint + highPoint) / 2)+1;
    var midPointB = Math.floor((lowPoint + highPoint) / 2);

    if (midPointA > highPoint) {
        midPointA = highPoint;
    }

    var mutatedButtonA = newButtons.map(x => x.map(xx => xx));
    mutatedButtonA[bi][0] = midPointA;
    var res1 = search(i, mutatedButtonA);

    var mutatedButtonB = newButtons.map(x => x.map(xx => xx));
    mutatedButtonB[bi][1] = midPointB;
    var res2 = search(i, mutatedButtonB);

    if (res1 < res2) {
        return res1;
    }

    return res2;
}

function calculateRanges(i, r) {
    var ranges = r.map(m => m.map(n => n));
    var lastHadChanges = true;
    var lastHadInvalid = false;

    while(lastHadChanges && !lastHadInvalid) {
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
        lastHadInvalid = ranges.some(r => r[0] > r[1]);
    }
    return [ranges, !lastHadInvalid];
}

var total = 0;

for(var i = 0; i < problems.length; i++) {
    searches = 0;
    var [buttons, _] = calculateRanges(i, problems[i].wirings.map(() => [0, Number.MAX_SAFE_INTEGER]));
    console.log('init', i, buttons.length, buttons);

    var v = search(i, buttons);
    console.log('ANSWER', i, v);
    console.log('STATS searches:', searches);
    total += v;
}

console.log(total);