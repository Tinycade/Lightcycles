// Defines grid and canvas
let canvas, ctx;
let grid;

// Defines Beholder detection
const Beholder = window['beholder-detection'];

// Defines the game state and players
let gameState = 0;
const players = [];
let winner;
let winnerDecided = false

let buttons = [];
let elem = document.getElementById("myCanvas");
canvasLeft = elem.offsetLeft + elem.clientLeft;
canvasTop = elem.offsetTop + elem.clientTop;

function startUpdate() {
    // Creates buttons as Path2D objects
    const host = new Path2D();
    const join = new Path2D();

    drawButton("Host Game", host, "orange", canvas, ctx, canvas.width/6, canvas.height/2, canvas.width*2/3, canvas.height/7);
    drawButton("Join Game", join, "blue", canvas, ctx, canvas.width/6, canvas.height*7/10, canvas.width*2/3, canvas.height/7);

    // Creates the title for the game
    ctx.beginPath();
    ctx.font = "bold italic 44pt Courier";
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.fillText("Lightcycles", canvas.width/2, canvas.height/3);
    ctx.closePath();
}

function drawButton(name, path, textColor, canvas, ctx, x1, y1, x2, y2) {
    
    path.rect(x1, y1, x2, y2);
    path.closePath();

    // Draws the button
    ctx.fillStyle = "#FFFFFF";
    ctx.fillStyle = "rgba(225,225,225,0.5)";
    ctx.fill(path);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#000000";
    ctx.stroke(path);

    ctx.font = "bold 26pt Courier";
    ctx.textAlign = "center";
    ctx.fillStyle = textColor;
    ctx.fillText(name, x1+x2/2, y1+y2/2 + 10);

    // Adjusts mouse click to canvas coordinates
    function getXY(canvas, event){ 
        const rect = canvas.getBoundingClientRect();
        const y = event.clientY - rect.top;
        const x = event.clientX - rect.left;
        return {x:x, y:y};
    }

    // Determines if a button was clicked
    document.addEventListener("click",  function (event) {
        const XY = getXY(canvas, event);
        // Determines if a button was clicked
        if(ctx.isPointInPath(path, XY.x, XY.y)) {
            // Change game states
            gameState = 1;
        }
    }, false);
}

function mainUpdate() {
    // Update players and grid
    players.forEach((p) => p.update(dt));
    grid.update(dt);
}

function endUpdate() {
    if (!winnerDecided) {
        if (winner.playerNumber == 0) {
            alert("No one wins!");
            location.reload();
        }
        else {
            alert("Player " + winner.playerNumber + " wins!");
            location.reload();
        }
        winnerDecided = true;
    }
}

let gameUpdates = [startUpdate, mainUpdate, endUpdate];

function init() {
    canvas = document.getElementById("myCanvas");
    canvas.width = 480;
    canvas.height = 480;
    ctx = canvas.getContext("2d");

    Beholder.init('#beholder-root', { overlay_params: {present: true}, camera_params: {rearCamera: true, torch: true, videoSize: 0}});

    // Initializes the grid
    grid = new Grid();

    // Initializes players
    players.push(new Lightcycle(1, 1, "right", 1, grid));
    players.push(new Lightcycle(cellCount - 2, 1, "left", 2, grid));
    players.push(new Lightcycle(1, cellCount/2, "right", 3, grid));
    players.push(new Lightcycle(cellCount - 2, cellCount/2, "left", 4, grid));

    // Listens for player updates
    // REMOVE LATER
    for (let i = 0; i < players.length; i++) document.addEventListener("keydown", (e) => { players[i].changeDirection(e) });

    requestAnimationFrame(update);
}


// Variables to keep track of game-time
var prevTime = Date.now();
var dt = 0;

function update() {
    // Determines how much time has passed since the previous update
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

    // Checks to see if all players except for one have crashed
    let playersAlive = 0;
    players.forEach((p) => {
        if (!p.gameOver) {
            playersAlive++;
            winner = p;
        }
    });
    if (playersAlive == 0) winner.playerNumber = 0;
    if (playersAlive <= 1) gameState = 2;

    draw();
    requestAnimationFrame(update);
}


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 1;

    // Checks the state of the game
    gameUpdates[gameState](dt);

    if (gameState > 0) {
        grid.draw(ctx);
        // Draws players
        players.forEach((p) => p.draw(ctx));
    }
}

window.onload = init;