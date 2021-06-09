let cells = [];
let cellSize;

// Fills the grid with empty cells
function createGrid() {
    cellSize = (canvas.width - (2*cellPadding)) / cellCount;

    for (var col = 0; col < cellCount; col++) {
        cells[col] = [];
        for (var row = 0; row < cellCount; row++) {
            cells[col][row] = { x: 0, y: 0, status: 0, life: cellLife };
        }
    }
}

// Draws the grid of cells
function drawCells() {
    for (var col = 0; col < cellCount; col++) {
        for (var row = 0; row < cellCount; row++) {
            var cellX = (col*cellSize) + cellPadding;
            var cellY = (row*cellSize) + cellPadding;
            cells[col][row].x = cellX;
            cells[col][row].y = cellY;

            // Creating boundary walls
            if (col == 0 || col == cellCount - 1) cells[col][row].status = -1;
            if (row == 0 || row == cellCount - 1) cells[col][row].status = -1;

            var cell = cells[col][row];

            // Draws a regular cell
            if (cell.status == 0) {
                ctx.beginPath();
                ctx.rect(cellX, cellY, cellSize, cellSize);
                ctx.strokeStyle = "#0095DD";
                ctx.stroke();
                ctx.closePath();

            // Draws a wall cell
            } else if (cell.status > 0) {
                ctx.beginPath();
                ctx.rect(cellX, cellY, cellSize, cellSize);
                ctx.fillStyle = players[cell.status - 1].innerColor;
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

// Determines how long a cell will stay a wall
function cellLifeTime(timeDifference) {
    for (var col = 0; col < cellCount; col++) {
        for (var row = 0; row < cellCount; row++) {
            if (cells[col][row].status > 0) cells[col][row].life -= timeDifference;
            if (cells[col][row].life < 0) cells[col][row].status = 0;
        }
    }
}
