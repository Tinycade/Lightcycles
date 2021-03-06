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
        this.innerColor = PLAYER_COLORS.INNER[playerNumber];
        this.outerColor = PLAYER_COLORS.OUTER[playerNumber];

        // Defines player conditions
        this.wallCount = maxWallCount;
        this.wall = true;
        this.recharging = false;
        this.gameOver = false;

        // Defines server connection
        this.connectedToServer = false;
        this.active = false;

        // Keeps track of the wall cells the player has created
        this.trail = [];

        // Defines value for when the player is reset in a new round
        this.startX = startX;
        this.startY = startY;
        this.startDirection = direction;
    }

    // Draws the player
    draw(ctx) {
        // Exit condition
        if (!this.active) return;

        ctx.beginPath();
        ctx.rect(this.drawX, this.drawY, this.grid.cellSize, this.grid.cellSize);
        if (!this.gameOver) {
            ctx.fillStyle = this.innerColor;
            ctx.strokeStyle = this.outerColor;
        }
        else {
            // Player has crashed
            ctx.fillStyle = "#EA4C46";
            ctx.strokeStyle = "#DC1C13";
        }
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.closePath();
    }

    update(dt) {
        // Exit condition
        if (!this.active) this.gameOver = true;
        if (this.gameOver) return;

        this.lerpTimer -= dt;

        var startX = cellPadding + this.x * this.grid.cellSize;
        var startY = cellPadding + this.y * this.grid.cellSize;
        var endX = cellPadding + this.targetX * this.grid.cellSize;
        var endY = cellPadding + this.targetY * this.grid.cellSize;

        // REMOVE LATER
        if (isHost) this.wall = true;

        if (this.lerpTimer < 0) {
            // New target cell
            this.lerpTimer = this.speed;
            this.changeCell();

            // Check to see if the player crashes
            if (playerNumber == this.playerNumber) this.crash(this.targetX, this.targetY);

            // Creates new walls if possible
            if (this.wallCount > 0 && !this.recharging && this.wall) {

                // Current cell is now a wall
                this.grid.setCell(this.playerNumber, this.x, this.y);
                this.wallCount--;

                this.trail.push({ x: this.x, y: this.y });

            } else {
                if (this.wallCount <= 0) this.recharging = true;
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

        // Update wall meter
        let wallMeter = document.getElementById("wall-meter")
        wallMeter.max = maxWallCount;
        wallMeter.value = this.wallCount;
    }

    // Determines which direction the player is moving in
    changeDirection(e) {
        // Movement
        if ( e.key == "a" || e.key == "ArrowLeft" || e == "Left" ) {
            if (this.direction != "right") this.direction = "left";
            if (!this.wall) this.direction = "left";
        }
        else if ( e.key == "d" || e.key == "ArrowRight" || e == "Right" ) {
            if (this.direction != "left") this.direction = "right";
            if (!this.wall) this.direction = "right";
        } 
        else if ( e.key == "w" || e.key == "ArrowUp" || e == "Up" ) {
            if (this.direction != "down") this.direction = "up";
            if (!this.wall) this.direction = "up";
        }
        else if ( e.key == "s" || e.key == "ArrowDown" || e == "Down" ) {
            if (this.direction != "up") this.direction = "down";
            if (!this.wall) this.direction = "down";
        }
    }

    changeWall(e) {
        // Toggle wall
        if ( e.key == "q" || e == "Wall On" ) this.wall = true;
        else if ( e.key == "e" || e == "Wall Off" ) this.wall = false;
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
    crash(x, y) {
        if (x <= 0 || x > cellCount ||
            y <= 0 || y > cellCount ||
            this.grid.getCell(x, y).status != -1) {

            if (!this.gameOver) {
                // Player has just crashed
                this.gameOver = true;
                 
            }
        }
    }

    crashAnimation() {
        // Spawns explosion particles
        for (let i = 0; i < randomNumber(15,20); i++) {
            particles.push(new Particle(this.drawX , this.drawY, randomNumber(5,10), this.innerColor, this.outerColor, this.direction));
        }

        // Shakes the screen
        shake(document.querySelector("#myCanvas"));
    }

    reset() {
        // Resets variables
        this.x = this.startX;
        this.y = this.startY;
        this.targetX = this.startX;
        this.targetY = this.startY;
        this.direction = this.startDirection;

        this.lerpTimer = 0;
        this.wallCount = maxWallCount;
        this.wall = true;
        this.recharging = false;

        // Reset trail
        // this.trail.forEach(wall => {this.grid.setCell(-1, wall.x, wall.y);});
        this.trail = [];

        this.gameOver = false;
    }
}