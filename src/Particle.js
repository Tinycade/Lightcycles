class Particle {
    constructor(x, y, radius, color, direction) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.direction = direction;
        this.velocity = { x:0, y:0 };
        this.alpha = 1;
        this.transparencyRate = randomNumber(0.015, 0.0175);
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.radius, this.radius);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }

    update() {
        this.draw();

        this.changeVelocity();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;

        this.alpha -= this.transparencyRate;
    }

    changeVelocity() {
        let minVelocity = 0.25;
        let maxVelocity = 0.85;

        let xMin = -maxVelocity,
            yMin = -maxVelocity,
            xMax = maxVelocity,
            yMax = maxVelocity;

        // Determine direction player was facing
        switch (this.direction) {
            case "left":
                xMin = minVelocity;
                xMax = maxVelocity;
                break;

            case "right":
                xMin = -maxVelocity;
                xMax = -minVelocity;
                break;

            case "up":
                yMin = minVelocity;
                yMax = maxVelocity;
                break;

            case "down":
                yMin = -maxVelocity;
                yMax = -minVelocity;
                break;
        }

        if (this.velocity.x == 0 && this.velocity.y == 0) {
            this.velocity.x = randomNumber(xMin, xMax) * 1.5;
            this.velocity.y = randomNumber(yMin, yMax) * 1.5;
        }
    }
}