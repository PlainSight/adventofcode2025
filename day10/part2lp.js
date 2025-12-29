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

function maxForFreeValues(formula, index) {
    var releventFormula = formula.filter(rr => rr[index] != 0);
    var maxValue = Number.MAX_SAFE_INTEGER;

    releventFormula.forEach(rf => {
        var value = rf[rf.length-1];
        if (value < maxValue) {
            maxValue = value;
        }
    });

    return Math.round(maxValue);
}

function rangeOfValueGivenValues(rowReduced, index) {
    var releventFormula = rowReduced.filter(rr => rr[index] != 0);
    var maxValue = Number.MAX_SAFE_INTEGER;

    releventFormula.forEach(rf => {
        var coefficient = rf[index];

        var right = rf[rf.length-1];
        var value = right / coefficient;
        if (value >= 0 && value < maxValue) {
            maxValue = value;
        }
    });

    if (maxValue == Number.MAX_SAFE_INTEGER) {
        console.log(releventFormula, index);

        return 0;
    }

    return Math.round(maxValue);
}

function printMath(formula, variables, pos, value) {
    console.log('button', pos,' = ', formula[formula.length-1] + 
        ' - (' + 
        formula.slice(pos, -1).map((f, fi) => f + '*' + variables[parseInt(pos) + fi]).join(' + ') 
        + ') = ' + value);
}

function calculateDependentVariables(formulaByVariable, variables) {
    var keys = Object.keys(formulaByVariable);

    for (var j = keys.length-1; j >= 0; j--) {
        var k = keys[j];
        var formula = formulaByVariable[k];

        var otherLeft = formula.slice(0, -1).reduce((a, c, ci) => {
            return a + c * variables[ci];
        }, 0);
        var right = formula[formula.length-1];
        var allRight = right - otherLeft;
        var value = allRight;

        //printMath(formula, variables, k, value);

        variables[k] = value;
    }

    return variables;
}

function evaluate(i, formulaByVariable, freeVariables) {
    var variables = freeVariables.map(fv => fv);

    variables = calculateDependentVariables(formulaByVariable, variables);

    if (variables.some(v => v < 0) || variables.some(v => v != Math.round(v))) {
        return Number.MAX_SAFE_INTEGER;
    }
    console.log('good values', variables);

    var pushes = variables.reduce((a, c) => a + c, 0);

    var good = true;

    problems[i].related.forEach(r => {
        var left = r.relatedButtons.reduce((a, b, bi) => {
            return a + b*variables[bi];
        }, 0);
        var right = r.max;
        if (left != right) {
            console.log('left', left, 'right', right, r);
            good = false;
        }
    });

    if (good) {
        console.log('ans', i, pushes);
        return pushes;
    } else {
        return Number.MAX_SAFE_INTEGER;
    }
}

function frac(a) {
    return {
        n: a,
        d: 1
    };
}

function mult(a, b) {
    var res = { 
        n: a.n * b.n,
        d: a.d * b.d
    };
    return simplify(res); 
}

function sub(a, b) {
    var res = {
        n: (b.d*a.n) - (a.d*b.n),
        d: a.d * b.d
    };
    return simplify(res);
}

function isOne(a) {
    return (a.n == 1 && a.d == 1);
}

function simplify(a) {
    return {
        n: a.n / gcd(a.n, a.d),
        d: a.d / gcd(a.n, a.d)
    }
}

function gcd(a, b) {
    if (b == 0) {
        return a;
    }
    return gcd(b, a % b); 
}

function solve(i) {
    var formula = problems[i].related.map(p => {
        return [...p.relatedButtons, p.max];
    });

    console.log(formula);

    var rowReduced = [];
    var remaining = formula.map(f => f.map(r => r));

    for (var pos = 0; pos < formula[0].length-1; pos++) {
        var fi = remaining.findIndex(f => f.slice(0, pos).every(v => v == 0) && f[pos] != 0);
        if (fi >= 0) {
            var f = remaining.splice(fi, 1);
            f = f[0];

            if (f[pos] != 1) {
                f = multiply(f, 1 / f[pos]);
            }

            remaining = remaining.map(r => {
                return eliminate(r, f, pos);
            });

            rowReduced = rowReduced.map(r => {
                return eliminate(r, f, pos);
            });

            rowReduced.push(f);
        }
    }

    remaining.forEach(r => {
        rowReduced.push(r);
    });

    rowReduced = rowReduced.filter(rr => !rr.every(r => r == 0));

    console.log(rowReduced);

    var formulaByVariable = {};
    var dependentVariables = [];

    rowReduced.forEach(rr => {
        dependentVariables.push(rr.findIndex(r => r == 1));
        formulaByVariable[rr.findIndex(r => r == 1)] = rr;
    })

    var freeVariables = formula[0].slice(0, -1).map((_, j) => j);
    freeVariables = freeVariables.filter(fv => !dependentVariables.includes(fv));

    var maxValues = [];

    freeVariables.forEach(fv => {
        maxValues.push(maxForFreeValues(formula, fv));
        //maxValues.push(rangeOfValueGivenValues(rowReduced, fv));
    });


    var total = maxValues.reduce((a, c) => a * (c+1), 1);

    console.log('free vars', freeVariables);
    console.log('max vals ', maxValues);
    console.log('fbv', formulaByVariable);

    var bestSolution = Number.MAX_SAFE_INTEGER;

    for(var t = 0; t < total; t++) {
        var variables = formula[0].slice(0, -1).map(_ => 0);

        var remainder = t;

        freeVariables.forEach((fv, i) => {
            var mod = maxValues[i]+1;
            var v = remainder % mod;
            remainder = Math.floor(remainder / mod);
            variables[fv] = v;
        });

        var score = evaluate(i, formulaByVariable, variables);
        if (score < bestSolution) {
            bestSolution = score;
        }
    }

    return bestSolution;
}


var total = 0;

for(var i = 0; i < problems.length; i++) {
    var v = solve(i);
    console.log('ANSWER', i, v);

    //fs.appendFileSync('p2lpanswers.txt', i + '\t' + v + '\r\n');

    total += v;
}

console.log(total);