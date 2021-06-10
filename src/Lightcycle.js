class Lightcycle {
    constructor(startX, startY, direction, playerNumber, grid) {
        // Defines player and grid
        this.playerNumber = playerNumber;
        this.grid = grid;

        // Defines player location
        this.x = startX; 
        this.y = startY;
        this.targetX = this.x;
        this.targetY = this.y;

        // Defines player movement
        this.drawX = 0;
        this.drawY = 0;
        this.lerpTimer = 0;
        this.speed = 90;
        this.direction = direction;

        // Defines player visuals
        this.innerColor = PLAYER_COLORS.INNER[playerNumber - 1];
        this.outerColor = PLAYER_COLORS.OUTER[playerNumber - 1];

        // Defines player conditions
        this.wallCount = maxWallCount;
        this.wall = true;
        this.recharging = false;
        this.gameOver = false;
    }

    // Draws the player
    draw(ctx) {
        // Exit condition
        if (this.gameOver) return;

        ctx.beginPath();
        ctx.rect(this.drawX, this.drawY, this.grid.cellSize, this.grid.cellSize);
        ctx.fillStyle = this.innerColor;
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = this.outerColor;
        ctx.stroke();
        ctx.closePath();
    }

    update(dt) {
        // Exit condition
        if (this.gameOver) return;

        this.lerpTimer -= dt;

        var startX = cellPadding + this.x * this.grid.cellSize;
        var startY = cellPadding + this.y * this.grid.cellSize;
        var endX = cellPadding + this.targetX * this.grid.cellSize;
        var endY = cellPadding + this.targetY * this.grid.cellSize;

        if (this.lerpTimer < 0) {
            // New target
            this.lerpTimer = this.speed;
            this.changeCell();

            // Creates new walls if possible
            if (this.wallCount > 0 && !this.recharging && this.wall) {
                // Current cell is now a wall
                this.grid.setCell(this.playerNumber, this.x, this.y);
                this.wallCount--;
            } else {
                this.recharging = true;
                if (this.wallCount < maxWallCount) this.wallCount += rechargeRate;
                if (this.wallCount > maxWallCount) this.wallCount = maxWallCount;

                // The player can generate walls again
                if (this.wallCount > minRecharge) this.recharging = false;
            }

            // Changes player location to target location
            this.x = this.targetX;
            this.y = this.targetY;
            this.drawX = endX;
            this.drawY = endY;
        } else {
            // Movement between cells
            this.drawX = startX + (startX - endX) * this.lerpTimer / this.speed;
            this.drawY = startY + (startY - endY) * this.lerpTimer / this.speed;
        }

        // Checks to see if the player has crashed
        this.crash();
    }

    // Determines which direction the player is moving in
    changeDirection(e) {
        // Movement
        if ( e.key == "d" || e.key == "ArrowRight" ) {
            if (this.direction != "left") this.direction = "right";
        }
        else if ( e.key == "a" || e.key == "ArrowLeft" ) {
            if (this.direction != "right") this.direction = "left";
        }
        else if ( e.key == "w" || e.key == "ArrowUp" ) {
            if (this.direction != "down") this.direction = "up";
        }
        else if ( e.key == "s" || e.key == "ArrowDown" ) {
            if (this.direction != "up") this.direction = "down";
        }

        // Toggle wall
        if ( e.key == "q" ) this.wall = true;
        else if ( e.key == "e" ) this.wall = false;
    }

    // Determines the next cell the player will travel to
    changeCell() {
        switch (this.direction) {
            case "left":
                this.targetX = this.x - 1;
                break;
    
            case "right":
                this.targetX = this.x + 1;
                break;
    
            case "up":
                this.targetY = this.y - 1;
                break;
    
            case "down":
                this.targetY = this.y + 1;
                break;
        }
    }

    // Lose conditions: Player crashes into wall or another player
    crash() {
        if (this.targetX <= 0 || this.targetX > cellCount) this.gameOver = true;
        if (this.targetY <= 0 || this.targetY > cellCount) this.gameOver = true;
        if (this.grid.getCell(this.targetX, this.targetY).status != 0) this.gameOver = true;
    }
}