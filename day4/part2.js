var fs = require('fs');

var input = fs.readFileSync('./input.txt', 'utf8').split('\r\n').map(n => n.split(''));

var ds = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1]
];

function remove(grid) {
    var toRemove = [];
    grid.forEach((r, y) => {
        r.forEach((c, x) => {
            if (c == '@') {
                var count = 0;
                ds.forEach(d => {
                    var tx = d[0] + x;
                    var ty = d[1] + y;
                    if (input[ty] && input[ty][tx] == '@') {
                        count++;
                    }
                });
                if (count < 4) {
                    toRemove.push([x, y]);
                }
            }
        })
    });
    var removed = toRemove.length;
    if (removed == 0) {
        return 0;
    }

    toRemove.forEach(tr => {
        grid[tr[1]][tr[0]] = '.';
    });

    return removed + remove(grid);
}

var removed = remove(input);

console.log(removed);