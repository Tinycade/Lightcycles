// Defines canvas
let canvas, ctx;

// Defines Beholder detection
const Beholder = window['beholder-detection'];

// Defines the game state
let gameState = 0;
let gameUpdates = [startUpdate, mainUpdate, endUpdate];

// Defines players
const player1 = new Cycle(0, 1, "right", 1, "#FFA219", "#FFD199");
const player2 = new Cycle(cellCount - 1, 1, "left", 2, "#A0B4F0", "#D9E1F9");
const player3 = new Cycle(0, cellCount/2, "right", 3, "#F96995", "#FDB4CA");
const player4 = new Cycle(cellCount - 1, cellCount/2, "left", 4, "#E0DA2F", "#F8F7D1");

let players = [player1, player2, player3, player4];


function init() {
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");

    Beholder.init('#beholder-root', { overlay_params: {present: true}, camera_params: {rearCamera: true, torch: true, videoSize: 0}});

    createGrid();

    // Listens for player updates
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

    // Checks the state of the game
    gameUpdates[gameState](dt);
    cellLifeTime(dt);

    // Updates players
    for (let i = 0; i < players.length; i++) {
        if (!players[i].gameOver) players[i].update(dt);
        players[i].crash();
    }

    draw();
    requestAnimationFrame(update);
}


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 1;

    drawCells();

    // Draws players
    for (let i = 0; i < players.length; i++) if (!players[i].gameOver) players[i].draw(ctx);
}


function startUpdate() {

}

function mainUpdate() {

}

function endUpdate() {

}

window.onload = init;