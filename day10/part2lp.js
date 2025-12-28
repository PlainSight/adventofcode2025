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
            relatedButtons: p.wirings.map((w, wi) => w.includes(ji) ? 1 : 0),
            max: j
        }
    });

    // for each value we can calculate the maximum number of presses for a set of buttons
});

function subtract(r1, r2, mult = 1) {
    // subtract r2 from r1
    return r1.map((v, i) => {
        return v - (mult*r2[i]);
    })
}

function multiply(r1, mult) {
    return r1.map(v => v * mult);
}

function eliminate(r1, r2, pos) {
    // r2 must be a pre-eliminated row with r2[pos] == 1
    if (r1[pos] != 0) {
        var mult = r1[pos];
        return subtract(r1, r2, mult);
    } else {
        return r1;
    }
}

function rangeOfValueGivenValues(rowReduced, currentVariables, index) {
    var releventFormula = rowReduced.filter(rr => rr[index] != 0);

    
}

function evaluate(i, rowReduced, freeVariables) {
    var variables = freeVariables.map(fv => fv);

    for(var j = rowReduced.length-1; j >= 0; j--) {
        // populate all variables
    }

    var pushes = variables.reduce((a, c) => a + c, 0);

    problems[i].related.forEach(r => {
        var left = relatedButtons.reduce((a, b, bi) => {
            return a + b*variables[bi];
        }, 0);
        var right = r.max;
        if (left != right) {
            console.log('THIS IS BROKEN');
        }
    });

    return pushes;
}

function calculate(i) {
    var formula = problems[i].related.map(p => {
        return [...p.relatedButtons, p.max];
    });

    console.log(formula);

    var rowReduced = [];
    var remaining = formula.map(f => f.map(r => r));

    for (var pos = 0; pos < formula.length && pos < formula[0].length-1; pos++) {
        var fi = remaining.findIndex(f => f.slice(0, pos).every(v => v == 0) && f[pos] != 0);
        if (fi >= 0) {
            var f = remaining.splice(fi, 1)[0];

            if (f[pos] != 1) {
                f = multiply(f, 1 / f[pos]);
            }

            rowReduced = rowReduced.map(r => {
                return eliminate(r, f, pos);
            });

            rowReduced.push(f);

            remaining = remaining.map(r => {
                return eliminate(r, f, pos);
            });
        }
    }

    remaining.forEach(r => {
        rowReduced.push(r);
    });

    console.log(rowReduced);
    rowReduced = rowReduced.filter(rr => !rr.every(r => r == 0));

    var dependentVariables = [];

    var j = 0;
    rowReduced.forEach(rr => {
        dependentVariables.push(rr.findIndex(r => r == 1));
    })

    var freeVariables = formula[0].slice(0, -1).map((_, j) => j);
    freeVariables = freeVariables.filter(fv => !dependentVariables.includes(fv));



    console.log('fv', freeVariables);
}


var total = 0;

for(var i = 0; i < problems.length; i++) {
    var v = calculate(i);
    console.log('ANSWER', i, v);
    total += v;
}

console.log(total);