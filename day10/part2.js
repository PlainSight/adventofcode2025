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

function remainderWillCap(i, pos, pushes) {
    problems[i].related[pos].forEach(r => [
        // if buttons are pushed which are related to this position then we must check if is possible to get the counter to the correct position without overflowing the related positions

    ])
}

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
        pushes: problems[i].wirings.map(() => 0)
    }];

    var saw = 0;

    console.log(problems[i].related);

    var solution = Number.MAX_SAFE_INTEGER;

    while (heap.length) {
        heap.sort((a, b) => b.v - a.v);
        saw++;
        var top = heap.pop();

        var topDist = distance(i, top.pushes);

        if (topDist == 0) {
            //done

            var score = pushCount(top.pushes);
            if (score < solution) {
                solution = score;
                console.log(top.pushes);
            }
        }

        // find cheap tricks

        var applicableSuggesions = problems[i].related.filter(f => f.relatedButtons.length == 2);

        applicableSuggesions = applicableSuggesions.filter(s => {
            return top.pushes.reduce((a, c, ci) => { return a + s.relatedButtons.includes(ci) ? c : 0 }, 0) < s.max
        });

        var buttonMinMaxes = applicableSuggesions.map(as => {
            var existantClicks = as.relatedButtons.reduce((a, c) => {
                return a + top.pushes[c];
            }, 0);
            return {
                buttons: as.relatedButtons,
                count: as.max - existantClicks
            };
        });

        function enqueue(pushes) {
            var dist = distance(i, pushes);
            var pc = pushCount(pushes);
            var k = key(value(i, pushes));

            if (dist < topDist && (!seen[k] || pc < seen[k]) && pc < solution) {
                heap.push({
                    v: dist,
                    pushes: pushes
                });
                seen[k] = pc;
            }
        }

        //console.log('reo', top.pushes, value(i, top.pushes), problems[i], applicableSuggesions, buttonMinMaxes);

        buttonMinMaxes.forEach(mm => {
            for(var j = 0; j < mm.count; j++) {
                var jj = mm.count - j;

                var newPushes = clone(top.pushes);
                newPushes[mm.buttons[0]] += j;
                newPushes[mm.buttons[1]] += jj;

                //console.log('SC', top.pushes, newPushes);

                enqueue(newPushes);
            }
        });

        for(var j = 0; j < top.pushes.length; j++) {
            var newPushes = clone(top.pushes);
            newPushes[j]++;

            enqueue(newPushes);
        }
    }

    console.log('SOLUTION', i, saw)

    return solution;
}

var total = 0;

for(var i = 0; i < problems.length; i++) {
    var v = search(i);
    total += v;
}

console.log(total);