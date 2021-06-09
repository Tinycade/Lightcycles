// Defines canvas and grid
var canvas, ctx;
var cellCount = 50;
var cellPadding = 0;
var cellSize;
var cells = [];
var cellLife = 60000;

// Defines Beholder detection
const Beholder = window['beholder-detection'];

var players = [];

// Defines Player 1
const player1 = new Cycle(0, 1, "right", 1);
var player1Fill = "#FFA219";
var player1Stroke = "#FFD199";

// Defines Player 2
const player2 = new Cycle(cellCount - 1, 1, "left", 2);
var player2Fill = "#A0B4F0";
var player2Stroke = "#D9E1F9";

// Defines Player 3
const player3 = new Cycle(0, cellCount/2, "right", 3);
var player3Fill = "#F96995";
var player3Stroke = "#FDB4CA";

// Defines Player 4
const player4 = new Cycle(cellCount - 1, cellCount/2, "left", 4);
var player4Fill = "#E0DA2F";
var player4Stroke = "#F8F7D1";


function init() {
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");

    Beholder.init('#beholder-root', { overlay_params: {present: true}, camera_params: {rearCamera: true, torch: true, videoSize: 0}});

    cellSize = (canvas.width - (2*cellPadding)) / cellCount;

    for (var col = 0; col < cellCount; col++) {
        cells[col] = [];
        for (var row = 0; row < cellCount; row++) {
            cells[col][row] = { x: 0, y: 0, status: 0, life: cellLife };
        }
    }

    requestAnimationFrame(update);
}


// Creates variables to keep track of game-time
var prevTime = Date.now();
var dt = 0;

function update() {
    var currentTime = Date.now();
    dt = currentTime - prevTime;
    prevTime = currentTime;

    // Beholder detection
    Beholder.update();
    var demoMarker = Beholder.getMarker(0);

    if (demoMarker.present) {
        var demoCenter = demoMarker.center;
        var demoRotation = demoMarker.rotation;
    
        console.log(demoCenter.x, demoCenter.y, demoRotation);
    }

    // Updates Player 1
    document.addEventListener("keydown", (e) => { changeDirection(e, player1) });
    if (!player1.gameOver) player1.update(dt);

    // Updates Player 2
    document.addEventListener("keydown", (e) => { changeDirection(e, player2) });
    if (!player2.gameOver) player2.update(dt);

    // Updates Player 3
    document.addEventListener("keydown", (e) => { changeDirection(e, player3) });
    if (!player3.gameOver) player3.update(dt);

    // Updates Player 4
    document.addEventListener("keydown", (e) => { changeDirection(e, player4) });
    if (!player4.gameOver) player4.update(dt);

    draw();

    // Check to see if any players have crashed
    for (var i = 0; i < players.length; i++) gameOver(players[i]);

    requestAnimationFrame(update);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 1;

    drawCells();
    cellLifeTime();

    // Draws Player 1
    if (!player1.gameOver) player1.draw(ctx, player1Fill, player1Stroke);
    else {
        for (var col = 0; col < cellCount; col++) {
            for (var row = 0; row < cellCount; row++) {
                // Clear the player's walls if they die
                //if (cells[col][row].status == 1) cells[col][row].status = 0;
            }
        }
    }

    // Draws Player 2
    if (!player2.gameOver) player2.draw(ctx, player2Fill, player2Stroke);
    else {
        for (var col = 0; col < cellCount; col++) {
            for (var row = 0; row < cellCount; row++) {
                // Clear the player's walls if they die
                //if (cells[col][row].status == 2) cells[col][row].status = 0;
            }
        }
    }

    // Draws Player 3
    if (!player3.gameOver) player3.draw(ctx, player3Fill, player3Stroke);
    else {
        for (var col = 0; col < cellCount; col++) {
            for (var row = 0; row < cellCount; row++) {
                // Clear the player's walls if they die
                //if (cells[col][row].status == 3) cells[col][row].status = 0;
            }
        }
    }

    // Draws Player 4
    if (!player4.gameOver) player4.draw(ctx, player4Fill, player4Stroke);
    else {
        for (var col = 0; col < cellCount; col++) {
            for (var row = 0; row < cellCount; row++) {
                // Clear the player's walls if they die
                //if (cells[col][row].status == 4) cells[col][row].status = 0;
            }
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
                if (cell.status == 1) ctx.fillStyle = player1Fill;
                else if (cell.status == 2) ctx.fillStyle = player2Fill;
                else if (cell.status == 3) ctx.fillStyle = player3Fill;
                else if (cell.status == 4) ctx.fillStyle = player4Fill;
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}


// Determines how long a cell will stay a wall
function cellLifeTime() {
    for (var col = 0; col < cellCount; col++) {
        for (var row = 0; row < cellCount; row++) {
            if (cells[col][row].status > 0) cells[col][row].life -= dt;
            if (cells[col][row].life < 0) cells[col][row].status = 0;
        }
    }
}


// Determines which direction the player is moving in
function changeDirection(e, player) {
    // Movement
    if ( e.key == "d" || e.key == "ArrowRight" ) {
        if (player.direction != "left") player.direction = "right";
    }
    else if ( e.key == "a" || e.key == "ArrowLeft" ) {
        if (player.direction != "right") player.direction = "left";
    }
    else if ( e.key == "w" || e.key == "ArrowUp" ) {
        if (player.direction != "down") player.direction = "up";
    }
    else if ( e.key == "s" || e.key == "ArrowDown" ) {
        if (player.direction != "up") player.direction = "down";
    }

    // Toggle wall
    if ( e.key == "q" ) player.wall = true;
    else if ( e.key == "e" ) player.wall = false;
}


// Player crashes into wall or another player
function gameOver(player) {
    // Lose conditions
    if (!player.gameOver) {
        if (player.targetX <= 0 || player.targetX > cellCount) player.gameOver = true;
        else if (player.targetY <= 0 || player.targetY > cellCount) player.gameOver = true;
        else if (cells[player.targetX][player.targetY].status != 0) player.gameOver = true;
    }

    //alert("GAME OVER");
    //document.location.reload();
}


// Sends data about the state of the game
function gameData() {
    for (var col = 0; col < cellCount; col++) {
        for (var row = 0; row < cellCount; row++) {
            cells[col][row].status;
        }
    }

    for (var i = 0; i < players.length; i++) {
        players[i].drawX;
        players[i].drawY;
    }
}

window.onload = init;