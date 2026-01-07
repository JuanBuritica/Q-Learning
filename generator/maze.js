
/**
 * Maze Generation Logic
 * Uses Randomized Kruskal's algorithm to generate a perfect maze.
 */

function generateMaze(cols, rows) {
    // A perfect maze with cols x rows has (cols+1)*(rows+1) vertices.
    // The sample format shows wall segments between vertices.
    // Vertex coordinates: (x, y) where 0 <= x <= cols and 0 <= y <= rows.

    const walls = [];

    // Horizontal walls
    for (let r = 0; r <= rows; r++) {
        for (let c = 0; c < cols; c++) {
            walls.push({ v1: [r, c], v2: [r, c + 1] });
        }
    }

    // Vertical walls
    for (let c = 0; c <= cols; c++) {
        for (let r = 0; r < rows; r++) {
            walls.push({ v1: [r, c], v2: [r + 1, c] });
        }
    }

    // Initialize Disjoint Set (Union-Find) for cells
    // Cells are indexed by (r, c) where 0 <= r < rows and 0 <= c < cols.
    const parent = Array.from({ length: rows * cols }, (_, i) => i);

    function find(i) {
        if (parent[i] === i) return i;
        return parent[i] = find(parent[i]);
    }

    function union(i, j) {
        const rootI = find(i);
        const rootJ = find(j);
        if (rootI !== rootJ) {
            parent[rootI] = rootJ;
            return true;
        }
        return false;
    }

    // Internal walls (those between two cells)
    const internalWalls = [];
    const boundaryWalls = [];

    for (const wall of walls) {
        const { v1, v2 } = wall;
        let cell1, cell2;

        if (v1[0] === v2[0]) { // Horizontal wall segment (between rows)
            const r = v1[0];
            const c = v1[1];
            if (r > 0 && r < rows) {
                cell1 = (r - 1) * cols + c;
                cell2 = r * cols + c;
                internalWalls.push({ wall, cell1, cell2 });
            } else {
                boundaryWalls.push(wall);
            }
        } else { // Vertical wall segment (between columns)
            const r = v1[0];
            const c = v1[1];
            if (c > 0 && c < cols) {
                cell1 = r * cols + (c - 1);
                cell2 = r * cols + c;
                internalWalls.push({ wall, cell1, cell2 });
            } else {
                boundaryWalls.push(wall);
            }
        }
    }

    // Shuffle internal walls
    for (let i = internalWalls.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [internalWalls[i], internalWalls[j]] = [internalWalls[j], internalWalls[i]];
    }

    const remainingWalls = [...boundaryWalls];

    for (const { wall, cell1, cell2 } of internalWalls) {
        if (union(cell1, cell2)) {
            // Remove wall (don't add to remaining)
        } else {
            remainingWalls.push(wall);
        }
    }

    // Sort walls to look more like the sample (optional but nice)
    remainingWalls.sort((a, b) => {
        if (a.v1[0] !== b.v1[0]) return a.v1[0] - b.v1[0];
        if (a.v1[1] !== b.v1[1]) return a.v1[1] - b.v1[1];
        if (a.v2[0] !== b.v2[0]) return a.v2[0] - b.v2[0];
        return a.v2[1] - b.v2[1];
    });

    // Handle Entrance and Exit
    // Sample says entrance on left, end on right.
    // Pick a random row for entrance (x=0) and exit (x=cols)
    const entranceRow = Math.floor(Math.random() * rows);
    const exitRow = Math.floor(Math.random() * rows);

    const entranceWall = { v1: [entranceRow, 0], v2: [entranceRow + 1, 0] };
    const exitWall = { v1: [exitRow, cols], v2: [exitRow + 1, cols] };

    // Remove entrance and exit walls from remainingWalls
    const finalWalls = remainingWalls.filter(w => {
        const isEntrance = (w.v1[0] === entranceWall.v1[0] && w.v1[1] === entranceWall.v1[1] && w.v2[0] === entranceWall.v2[0] && w.v2[1] === entranceWall.v2[1]);
        const isExit = (w.v1[0] === exitWall.v1[0] && w.v1[1] === exitWall.v1[1] && w.v2[0] === exitWall.v2[0] && w.v2[1] === exitWall.v2[1]);
        return !isEntrance && !isExit;
    });

    return {
        cols,
        rows,
        walls: finalWalls
    };
}

function formatMaze(maze) {
    let output = `${maze.rows} ${maze.cols}\n`;
    output += `${maze.walls.length}\n`;
    maze.walls.forEach(w => {
        // Output format: y1 x1 y2 x2
        // Since v1 is [row, col], y is row (index 0) and x is col (index 1)
        output += `${w.v1[0]} ${w.v1[1]} ${w.v2[0]} ${w.v2[1]}\n`;
    });
    return output;
}
