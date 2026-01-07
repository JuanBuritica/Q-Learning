
let mazeEnv = null;
let agent = null;
let ctx = null;
let canvas = null;
let cellSize = 30;

document.addEventListener("DOMContentLoaded", () => {
    canvas = document.getElementById("mazeCanvas");
    ctx = canvas.getContext("2d");
});

function log(msg) {
    const logDiv = document.getElementById("log");
    logDiv.innerHTML += `<div>${msg}</div>`;
    logDiv.scrollTop = logDiv.scrollHeight;
}

function uploadMaze() {
    const fileInput = document.getElementById("mazeFile");
    if (fileInput.files.length === 0) {
        alert("Please select a file first.");
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        const content = e.target.result;
        try {
            mazeEnv = new MazeEnv(content);
            log("Maze loaded successfully (Client-side).");
            log(`Dimensions: ${mazeEnv.n_rows}x${mazeEnv.n_cols}`);

            document.getElementById("trainBtn").disabled = false;
            document.getElementById("solveBtn").disabled = true; // Reset solve button

            drawMaze();
        } catch (err) {
            log(`Error parsing maze: ${err.message}`);
        }
    };

    reader.onerror = function () {
        log("Error reading file.");
    };

    reader.readAsText(file);
}

function trainAgent() {
    if (!mazeEnv) return;

    const episodes = parseInt(document.getElementById("episodes").value) || 2000;
    const btn = document.getElementById("trainBtn");

    btn.disabled = true;
    btn.textContent = "Training...";
    log(`Starting training for ${episodes} episodes...`);

    // Use setTimeout to allow UI to update before starting heavy computation
    setTimeout(() => {
        agent = new QLearningAgent(mazeEnv, {
            alpha: 0.5,
            gamma: 0.99,
            epsilon: 1.0,
            epsilonDecay: 0.999
        });

        const startTime = performance.now();

        for (let ep = 0; ep < episodes; ep++) {
            let state = mazeEnv.reset();
            let done = false;

            // Step limit to prevent infinite loops
            for (let step = 0; step < 200; step++) {
                const action = agent.chooseAction(state);
                const [nextState, reward, isDone] = mazeEnv.step(action);
                agent.update(state, action, reward, nextState, isDone);
                state = nextState;
                if (isDone) {
                    done = true;
                    break;
                }
            }
            agent.decayEpsilon();
        }

        const endTime = performance.now();
        log(`Training finished in ${((endTime - startTime) / 1000).toFixed(3)}s.`);

        document.getElementById("solveBtn").disabled = false;
        btn.disabled = false;
        btn.textContent = "Train Agent";
    }, 10);
}

function solveMaze() {
    if (!mazeEnv || !agent) return;

    const btn = document.getElementById("solveBtn");
    btn.disabled = true;

    log("Solving maze...");

    let state = mazeEnv.reset();
    const path = [state];
    let done = false;

    // Temporarily disable exploration
    const oldEpsilon = agent.epsilon;
    agent.epsilon = 0;

    const maxSteps = mazeEnv.n_rows * mazeEnv.n_cols * 2;
    for (let i = 0; i < maxSteps; i++) {
        const action = agent.bestAction(state);
        const [nextState, reward, isDone] = mazeEnv.step(action);
        path.push(nextState);
        state = nextState;
        if (isDone) {
            done = true;
            break;
        }
    }

    agent.epsilon = oldEpsilon;

    if (done) {
        log(`Solution found! Steps: ${path.length - 1}`);
        animatePath(path).then(() => {
            btn.disabled = false;
        });
    } else {
        log("No solution found within step limit.");
        btn.disabled = false;
    }
}

function drawMaze() {
    if (!mazeEnv) return;

    const width = mazeEnv.n_cols * cellSize;
    const height = mazeEnv.n_rows * cellSize;

    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    // Draw walls
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.beginPath();

    mazeEnv.walls.forEach(segKey => {
        const [p1Str, p2Str] = segKey.split('|');
        const [x1, y1] = p1Str.split(',').map(Number);
        const [x2, y2] = p2Str.split(',').map(Number);

        ctx.moveTo(x1 * cellSize, y1 * cellSize);
        ctx.lineTo(x2 * cellSize, y2 * cellSize);
    });
    ctx.stroke();

    // Draw Start (Green)
    const [startR, startC] = mazeEnv.start;
    ctx.fillStyle = "#2ecc71";
    ctx.fillRect(startC * cellSize + 5, startR * cellSize + 5, cellSize - 10, cellSize - 10);

    // Draw Goal (Red)
    const [goalR, goalC] = mazeEnv.goal;
    ctx.fillStyle = "#e74c3c";
    ctx.fillRect(goalC * cellSize + 5, goalR * cellSize + 5, cellSize - 10, cellSize - 10);

    // Grid lines
    ctx.strokeStyle = "#eee";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let r = 0; r <= mazeEnv.n_rows; r++) {
        ctx.moveTo(0, r * cellSize);
        ctx.lineTo(width, r * cellSize);
    }
    for (let c = 0; c <= mazeEnv.n_cols; c++) {
        ctx.moveTo(c * cellSize, 0);
        ctx.lineTo(c * cellSize, height);
    }
    ctx.stroke();
}

function drawAgent(r, c) {
    drawMaze();
    ctx.fillStyle = "#3498db";
    ctx.beginPath();
    ctx.arc(
        c * cellSize + cellSize / 2,
        r * cellSize + cellSize / 2,
        cellSize / 3,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

async function animatePath(path) {
    for (const [r, c] of path) {
        drawAgent(r, c);
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}
