
let mazeEnv = null;
let agent = null;
let ctx = null;
let canvas = null;
let cellSize = 30;

document.addEventListener("DOMContentLoaded", () => {
    canvas = document.getElementById("mazeCanvas");
    ctx = canvas.getContext("2d");

    window.addEventListener("resize", () => {
        if (mazeEnv) {
            drawMaze();
        }
    });

    // Check for auto-loaded maze from generator
    const autoMaze = localStorage.getItem('autoLoadMaze');
    if (autoMaze) {
        localStorage.removeItem('autoLoadMaze');
        try {
            mazeEnv = new MazeEnv(autoMaze);
            log("<strong>Maze loaded from Generator.</strong>");
            log(`Dimensions: ${mazeEnv.n_cols}x${mazeEnv.n_rows}`);

            document.getElementById("trainBtn").disabled = false;
            document.getElementById("solveBtn").disabled = true;
            document.getElementById("empty-state").style.display = 'none';

            drawMaze();

            // Auto-start training
            log("Auto-starting training...");
            trainAgent();

        } catch (err) {
            log(`Error loading generated maze: ${err.message}`);
        }
    }
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
            log(`Dimensions: ${mazeEnv.n_cols}x${mazeEnv.n_rows}`);

            document.getElementById("trainBtn").disabled = false;
            document.getElementById("solveBtn").disabled = true; // Reset solve button
            document.getElementById("empty-state").style.display = 'none';

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
        const maxStepsPerEpisode = Math.max(200, mazeEnv.n_rows * mazeEnv.n_cols);

        for (let ep = 0; ep < episodes; ep++) {
            if (ep % Math.max(1, Math.floor(episodes / 10)) === 0 && ep > 0) {
                log(`Training... ${Math.round((ep / episodes) * 100)}% complete`);
            }
            let state = mazeEnv.reset();
            let done = false;

            // Step limit to prevent infinite loops, scaled by maze size
            for (let step = 0; step < maxStepsPerEpisode; step++) {
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

    const container = canvas.parentElement;
    const padding = 20;
    const availableWidth = container.clientWidth - padding * 2;
    const availableHeight = container.clientHeight - padding * 2;

    // Calculate cell size to fit the container
    cellSize = Math.min(
        availableWidth / mazeEnv.n_cols,
        availableHeight / mazeEnv.n_rows,
        40 // Max cell size for small mazes
    );

    const width = mazeEnv.n_cols * cellSize;
    const height = mazeEnv.n_rows * cellSize;

    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    // Grid lines (subtle)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
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

    // Draw walls (Clean White)
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = Math.max(1, cellSize / 10);
    ctx.lineCap = "round";
    ctx.shadowBlur = 0;

    ctx.beginPath();
    mazeEnv.walls.forEach(segKey => {
        const [p1Str, p2Str] = segKey.split('|');
        const [x1, y1] = p1Str.split(',').map(Number);
        const [x2, y2] = p2Str.split(',').map(Number);

        ctx.moveTo(x1 * cellSize, y1 * cellSize);
        ctx.lineTo(x2 * cellSize, y2 * cellSize);
    });
    ctx.stroke();

    // Reset shadow for other drawings
    ctx.shadowBlur = 0;

    // Draw Start (Soft Green Circle)
    const [startR, startC] = mazeEnv.start;
    ctx.fillStyle = "rgba(46, 204, 113, 0.3)";
    ctx.beginPath();
    ctx.arc(startC * cellSize + cellSize / 2, startR * cellSize + cellSize / 2, cellSize / 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#2ecc71";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw Goal (Soft Red Circle)
    const [goalR, goalC] = mazeEnv.goal;
    ctx.fillStyle = "rgba(231, 76, 60, 0.3)";
    ctx.beginPath();
    ctx.arc(goalC * cellSize + cellSize / 2, goalR * cellSize + cellSize / 2, cellSize / 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#e74c3c";
    ctx.lineWidth = 2;
    ctx.stroke();
}

function drawPath(path) {
    if (path.length < 2) return;

    ctx.strokeStyle = "rgba(129, 140, 248, 0.4)";
    ctx.lineWidth = Math.max(2, cellSize / 6);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowBlur = 10;
    ctx.shadowColor = "rgba(129, 140, 248, 0.5)";

    ctx.beginPath();
    ctx.moveTo(
        path[0][1] * cellSize + cellSize / 2,
        path[0][0] * cellSize + cellSize / 2
    );

    for (let i = 1; i < path.length; i++) {
        ctx.lineTo(
            path[i][1] * cellSize + cellSize / 2,
            path[i][0] * cellSize + cellSize / 2
        );
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
}

function drawAgent(r, c, history = []) {
    drawMaze();
    drawPath(history);

    // Agent Glow
    ctx.shadowBlur = 15;
    ctx.shadowColor = "rgba(99, 102, 241, 0.8)";
    ctx.fillStyle = "#818cf8";

    ctx.beginPath();
    ctx.arc(
        c * cellSize + cellSize / 2,
        r * cellSize + cellSize / 2,
        cellSize / 3.5,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // Inner white dot for "eye" look
    ctx.shadowBlur = 0;
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(c * cellSize + cellSize / 2, r * cellSize + cellSize / 2, cellSize / 8, 0, Math.PI * 2);
    ctx.fill();
}

async function animatePath(path) {
    const history = [];
    for (const [r, c] of path) {
        history.push([r, c]);
        drawAgent(r, c, history);
        await new Promise(resolve => setTimeout(resolve, 80));
    }
}
