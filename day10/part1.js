var fs = require('fs');

var input = fs.readFileSync('./input.txt', 'utf8').split('\r\n');

var problems = input.map(i => {
    var parts = /\[(.+)\](.+)\{(.+)\}/.exec(i);
    var lights = parts[1].split('').map((n) => n == '#' ? 1 : 0).reduce((a, c, j) => {
        return c ? flip(a, j) : a;
    }, 0);
    var buttonWirings = parts[2].split(/[\s+\(\)]/).filter(n => n != '');
    var joltageReqs = parts[3];
    return {
        lights: lights,
        wirings: buttonWirings.map(n => n.split(',').map(x => parseInt(x))),
        joltages: joltageReqs,
        best: Number.MAX_SAFE_INTEGER,
        cache: {}
    }
});

function flip(a, place) {
    return a ^ (1 << place);
}

function act(a, button) {
    var r = a;
    button.forEach(b => {
        r = flip(r, b);
    })
    return r;
}

function wasPushed(f, button) {
    return f & (1 << button);
}

function check(a, b) {
    return a == b;
}

function leastPushes(index, state, lastButtons, pushes) {
    var prob = problems[index];

    if (pushes >= prob.best || prob.cache[state] < pushes) {
        return Number.MAX_SAFE_INTEGER;
    } else {
        prob.cache[state] = pushes;
    }

    if (check(prob.lights, state)) {
        prob.cache[state] = pushes;
        if (pushes < prob.best) {
            prob.best = pushes;
        }
        return pushes;
    }

    var low = Number.MAX_SAFE_INTEGER;

    prob.wirings.forEach((w, wi) => {
        if (!wasPushed(lastButtons, wi)) {
            var newState = act(state, w);
            var amount = leastPushes(index, newState, flip(lastButtons, wi), pushes+1);
            if (amount < low) {
                low = amount;
            }
        }
    });

    return low;
};

var total = 0;

for(var i = 0; i < problems.length; i++) {
    var p = leastPushes(i, 0, 0, 0);
    total += p;
    console.log(i, p);
}

console.log(total);