// Defines canvas
let canvas, ctx;

// Defines Beholder detection
const Beholder = window['beholder-detection'];

// Defines the game state
let gameState = 1;
const players = [];
let grid;

function startUpdate() {

}

function mainUpdate() {
    // update players
    players.forEach((p) => p.update(dt));
    grid.update(dt);
}

function endUpdate() {

}

let gameUpdates = [startUpdate, mainUpdate, endUpdate];

function init() {
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");

    Beholder.init('#beholder-root', { overlay_params: {present: true}, camera_params: {rearCamera: true, torch: true, videoSize: 0}});

    grid = new Grid();

    // init players
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

    // Checks the state of the game
    gameUpdates[gameState](dt);

    draw();
    requestAnimationFrame(update);
}


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 1;

    grid.draw(ctx);

    // Draws players
    players.forEach((p) => p.draw(ctx));
}

window.onload = init;