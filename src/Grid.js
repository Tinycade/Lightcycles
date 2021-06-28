class Grid {
    constructor() {
        this.cells = [];
        this.cellSize = (canvas.width - (2*cellPadding)) / cellCount;

        for (let col = 0; col < cellCount; col++) {
            this.cells[col] = [];

            for (let row = 0; row < cellCount; row++) {
                this.cells[col][row] = {
                    x: (col * this.cellSize) + cellPadding,
                    y: (row * this.cellSize) + cellPadding,
                    status: -1,
                    life: cellLife
                };

                // Creating boundary walls
                if (col == 0 || col == cellCount - 1) this.cells[col][row].status = -2;
                if (row == 0 || row == cellCount - 1) this.cells[col][row].status = -2;
            }
        }
    }

    update(dt) {
        // FIX: Cells get set to status of 0 permanently when their timer expires
        /*
        this.cells.forEach((col) => {
            col.forEach((cell) => {
                if (cell.status > 0) cell.life -= dt;
                if (cell.life < 0) cell.status = 0;
            });
        });
        */
    }

    draw(ctx) {
        for (let col = 0; col < cellCount; col++) {
            for (let row = 0; row < cellCount; row++) {
    
                let cell = this.cells[col][row];
    
                // Draws a regular cell
                if (cell.status == -1) {
                    ctx.beginPath();
                    ctx.rect(cell.x, cell.y, this.cellSize, this.cellSize);
                    ctx.strokeStyle = "#0095DD";
                    ctx.stroke();
                    ctx.closePath();
    
                // Draws a wall cell
                } else if (cell.status >= 0) {
                    ctx.beginPath();
                    ctx.rect(cell.x, cell.y, this.cellSize, this.cellSize);
                    ctx.fillStyle = PLAYER_COLORS.INNER[cell.status];
                    ctx.fill();
                    ctx.closePath();
                }
            }
        }
    }

    setCell(status, x, y) {
        this.cells[x][y].status = status;
    }

    getCell(x, y) {
        return this.cells[x][y];
    }
}
