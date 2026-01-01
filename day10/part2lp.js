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

function multiply(r1, mult) {
    return r1.map(v => fmult(v, mult));
}

function eliminate(r1, r2, pos) {
    // r2 must be a pre-eliminated row with r2[pos] == 1
    if (nonZero(r1[pos])) {
        var mult = r1[pos];
        return r1.map((v, i) => {
            return fsub(v, fmult(mult, r2[i]));
        });
    } else {
        return r1;
    }
}

function maxForFreeValues(formula, values, index) {
    var releventFormula = formula.filter(rr => rr[index] != 0);
    var maxValue = Number.MAX_SAFE_INTEGER;

    releventFormula.forEach(rf => {
        var left = rf.slice(0, -1).reduce((a, c, ci) => {
            return a + c*Math.max(values[ci], 0);
        }, 0);

        var right = rf[rf.length-1];

        var value = right - left;

        if (value >= 0 && value < maxValue) {
            maxValue = value;
        }
    });

    return maxValue;
}

function calculateDependentVariables(formulaByVariable, variables) {
    var keys = Object.keys(formulaByVariable);

    for (var j = keys.length-1; j >= 0; j--) {
        var k = keys[j];
        var formula = formulaByVariable[k];

        var otherLeft = formula.slice(0, -1).reduce((a, c, ci) => {
            return fadd(a, fmult(c, frac(variables[ci])));
        }, frac(0));
        var right = formula[formula.length-1];
        var allRight = fsub(right, otherLeft);
        var value = fval(allRight);

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

    var pushes = variables.reduce((a, c) => a + c, 0);

    //console.log('ans', i, pushes);
    return pushes;
}

function frac(a) {
    return {
        n: a,
        d: 1
    };
}

function fmult(a, b) {
    var res = { 
        n: a.n * b.n,
        d: a.d * b.d
    };
    return simplify(res);
}

function fadd(a, b) {
    var res = {
        n: (b.d*a.n) + (a.d*b.n),
        d: a.d * b.d
    };
    return simplify(res);
}

function fval(a) {
    return a.n / a.d;
}

function fsub(a, b) {
    var res = {
        n: (b.d*a.n) - (a.d*b.n),
        d: a.d * b.d
    };
    return simplify(res);
}

function inv(a) {
    return {
        n: a.d,
        d: a.n
    }
}

function isZero(a) {
    return a.n == 0;
}

function isOne(a) {
    return a.n == 1 && a.d == 1;
}

function nonZero(a) {
    return a.n != 0;
}

function simplify(a) {
    return {
        n: a.n / gcd(a.n, a.d),
        d: a.d / gcd(a.n, a.d)
    }
}

function gcd(a, b) {
    while (b !== 0) {
        let temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

function solve(i) {
    var formula = problems[i].related.map(p => {
        return [...p.relatedButtons, p.max];
    });

    var rowReduced = [];
    var remaining = formula.map(f => f.map(r => frac(r)));

    for (var pos = 0; pos < formula[0].length-1; pos++) {
        var fi = remaining.findIndex(f => f.slice(0, pos).every(v => isZero(v)) && nonZero(f[pos]));
        if (fi >= 0) {
            var f = remaining.splice(fi, 1);
            f = f[0];

            if (!isOne(f[pos])) {
                f = multiply(f, inv(f[pos]));
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

    rowReduced = rowReduced.filter(rr => !rr.every(r => isZero(r)));

    var formulaByVariable = {};
    var dependentVariables = [];

    rowReduced.forEach(rr => {
        dependentVariables.push(rr.findIndex(r => isOne(r)));
        formulaByVariable[rr.findIndex(r => isOne(r))] = rr;
    })

    var freeVariables = formula[0].slice(0, -1).map((_, j) => j);
    freeVariables = freeVariables.filter(fv => !dependentVariables.includes(fv));
    // freeVariables.sort((a, b) => {
    //     return problems[i].wirings[a].length - problems[i].wirings[b].length;
    // });

    return searchFreeVariables(i, formula, formulaByVariable, formula[0].slice(0, -1).map(_ => 0), freeVariables);
}

function searchFreeVariables(i, formula, formulaByVariable, values, freeVariablesRemaining) {
    if (freeVariablesRemaining.length == 0) {
        return evaluate(i, formulaByVariable, values);
    }

    var topFreeVariable = freeVariablesRemaining[0];
    var fvr = freeVariablesRemaining.slice(1);

    var maxVal = maxForFreeValues(formula, values, topFreeVariable);

    var bestScore = Number.MAX_SAFE_INTEGER;

    for(var x = 0; x <= maxVal; x++) {
        var newValues = values.map(v => v);
        newValues[topFreeVariable] = x;
        var score = searchFreeVariables(i, formula, formulaByVariable, newValues, fvr);

        if (score < bestScore) {
            bestScore = score;
        }
    }

    return bestScore;
}


var total = 0;

for(var i = 0; i < problems.length; i++) {
    var v = solve(i);
    console.log('ANSWER', i, v);

    total += v;
}

console.log(total);