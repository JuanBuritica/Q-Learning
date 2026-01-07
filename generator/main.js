
// import { generateMaze, formatMaze } from './maze.js';

const colsInput = document.getElementById('cols');
const rowsInput = document.getElementById('rows');
const generateBtn = document.getElementById('generate');
const downloadBtn = document.getElementById('download');
const canvas = document.getElementById('preview');
const ctx = canvas.getContext('2d');
const wallCountEl = document.getElementById('wall-count');

let currentMaze = null;

function drawMaze(maze) {
    const padding = 20;
    const cellSize = Math.min(
        (canvas.width - padding * 2) / maze.cols,
        (canvas.height - padding * 2) / maze.rows
    );

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    const offsetX = (canvas.width - maze.cols * cellSize) / 2;
    const offsetY = (canvas.height - maze.rows * cellSize) / 2;

    maze.walls.forEach(w => {
        const [r1, c1, r2, c2] = [w.v1[0], w.v1[1], w.v2[0], w.v2[1]];

        ctx.beginPath();
        // The file format uses (row, col) coordinates
        // Canvas uses (x, y) where x is col and y is row
        ctx.moveTo(offsetX + c1 * cellSize, offsetY + r1 * cellSize);
        ctx.lineTo(offsetX + c2 * cellSize, offsetY + r2 * cellSize);
        ctx.stroke();
    });

    // Draw full grid border with entrance and exit gaps
    ctx.strokeStyle = '#818cf8';

    // We already have internal walls, now we need to visualize the boundary accurately
    // The maze generator already handles entrance/exit by REMOVING walls.
    // However, the generator only starts with a full list of segments including boundaries.
}

function handleGenerate() {
    const cols = parseInt(colsInput.value) || 10;
    const rows = parseInt(rowsInput.value) || 10;

    currentMaze = generateMaze(cols, rows);
    drawMaze(currentMaze);

    wallCountEl.textContent = `Total Walls: ${currentMaze.walls.length}`;
    downloadBtn.disabled = false;
}

function handleDownload() {
    if (!currentMaze) return;

    const content = formatMaze(currentMaze);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `maze_${currentMaze.cols}x${currentMaze.rows}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

generateBtn.addEventListener('click', handleGenerate);
downloadBtn.addEventListener('click', handleDownload);

// Initial generate
handleGenerate();

// Responsive canvas
window.addEventListener('resize', () => {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = 400;
    if (currentMaze) drawMaze(currentMaze);
});

// Set initial canvas size
canvas.width = canvas.parentElement.clientWidth;
canvas.height = 400;
if (currentMaze) drawMaze(currentMaze);
