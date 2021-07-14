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

    }

    draw(ctx) {
        // Draws outlines along the grid 
        for (let col = 1; col < cellCount - 1; col += 4) {
            for (let row = 1; row < cellCount - 1; row += 4) {
                let cell = this.cells[col][row]; 

                ctx.beginPath();
                ctx.rect(cell.x, cell.y, this.cellSize * 4, this.cellSize * 4);
                ctx.strokeStyle = "rgba(0, 149, 221, 0.15)";
                ctx.lineWidth = 4;
                ctx.stroke();
                ctx.closePath();
            }
        }

        // Draws normal grid cells
        for (let col = 0; col < cellCount; col++) {
            for (let row = 0; row < cellCount; row++) {
    
                let cell = this.cells[col][row];
    
                // Draws a regular cell
                if (cell.status == -1) {
                    ctx.beginPath();
                    ctx.rect(cell.x, cell.y, this.cellSize, this.cellSize);
                    ctx.strokeStyle = "rgba(0, 149, 221, 0.05)";
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    ctx.closePath();
    
                // Draws a wall cell
                } else if (cell.status >= 0) {
                    ctx.beginPath();
                    ctx.rect(cell.x, cell.y, this.cellSize, this.cellSize);
                    ctx.fillStyle = PLAYER_COLORS.INNER[cell.status];
                    ctx.fill();
                    ctx.closePath();

                    if (this.getCell(col, row).status >= 0) this.checkNearbyCells(col, row);
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

    checkNearbyCells(x, y) {
        let centerCell = this.getCell(x,y);
        let leftCell = this.getCell(x-1,y);
        let rightCell = this.getCell(x+1,y);
        let upCell = this.getCell(x,y+1);
        let downCell = this.getCell(x,y-1);

        let nearbyCells = [leftCell, rightCell, upCell, downCell];

        nearbyCells.forEach(nearbyCell => {
            if (nearbyCell.status == centerCell.status) {
                this.drawRect(centerCell, nearbyCell);
            }
        });
    }

    drawRect(cell1, cell2) {
        let x = cell1.x;
        let y = cell1.y;

        ctx.beginPath();
        ctx.rect(x, y, this.cellSize, this.cellSize);
        ctx.fillStyle = PLAYER_COLORS.INNER[cell1.status];
        ctx.fill();
        ctx.closePath();
    }

    resetCells() {
        for (let col = 0; col < cellCount; col++) {
            for (let row = 0; row < cellCount; row++) {
                let cell = this.cells[col][row]; 
                if (cell.status >= 0) cell.status = -1;
            }
        }
    }
}
