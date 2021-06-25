// Defines grid and canvas
let canvas, ctx;
let grid;

// Defines Beholder detection
//const Beholder = window['beholder-detection'];

// Defines the game state and players
let gameState = 0;
const players = [];
let winner;
let winnerDecided = false

// Creates "Host Room" and "Join Room" buttons
let buttons = [];
let elem = document.getElementById("myCanvas");
canvasLeft = elem.offsetLeft + elem.clientLeft;
canvasTop = elem.offsetTop + elem.clientTop;

// Creates particles when a player crashes
let particles = [];

function startUpdate() {

}

function roomUpdate() {

}

function joinUpdate() {

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

let gameUpdates = [startUpdate, roomUpdate, joinUpdate, mainUpdate, endUpdate];

function init() {
    canvas = document.getElementById("myCanvas");
    canvas.width = 480;
    canvas.height = 480;
    ctx = canvas.getContext("2d");

    //Beholder.init('#beholder-root', { overlay_params: {present: true}, camera_params: {rearCamera: true, torch: true, videoSize: 0}});

    // Initializes the grid
    grid = new Grid();

    // Initializes players
    players.push(new Lightcycle(1, 1, "right", 1, grid));
    players.push(new Lightcycle(cellCount - 2, 1, "left", 2, grid));
    players.push(new Lightcycle(1, cellCount/2, "right", 3, grid));
    players.push(new Lightcycle(cellCount - 2, cellCount/2, "left", 4, grid));

    // REMOVE LATER
    document.addEventListener("keydown", (e) => { 
        if (gameState == 3 && players[playerNumber].active) players[playerNumber].changeDirection(e) 
    });
    
    document.querySelector("#host-button").addEventListener('click', (e) => { 
        hostGame(key => {
            document.querySelector("#start-screen").classList.add("hidden");
            document.querySelector("#host-screen").classList.remove("hidden");
            document.querySelector("#start-button").classList.remove("hidden");
            document.querySelector("#room-code").innerHTML = key;
        })
     })
    
    document.getElementById("client-button").addEventListener("click", () => {
        document.querySelector("#start-screen").classList.add("hidden");
        document.querySelector("#join-screen").classList.remove("hidden");
        gameState = 2;
    });

    document.getElementById("join-button").addEventListener("click", () => {
        joinRoom(
            document.getElementById('room-field').value.toUpperCase(),
            (key, playerID) => {
                document.querySelector("#join-screen").classList.add("hidden");
                document.querySelector("#host-screen").classList.remove("hidden");
                document.querySelector("#room-code").innerHTML = key;
                gameState = 1;

                playerNumber = playerID;
                players[playerNumber].connectedToServer = true;
            }
        )
    });

    document.getElementById("start-button").addEventListener("click", startGame);

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

    /*
    // Beholder detection
    Beholder.update();
    var demoMarker = Beholder.getMarker(0);

    
    if (demoMarker.present) {
        var demoCenter = demoMarker.center;
        var demoRotation = demoMarker.rotation;
    
        console.log(demoCenter.x, demoCenter.y, demoRotation);
    }
    */

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

    if (gameState > 2) {
        grid.draw(ctx);
        // Draws players
        players.forEach((p) => p.draw(ctx));
    }

    // Creates particles and removes them after a short period
    particles.forEach( (particle, index) => {
        if (particle.alpha <= 0) particles.splice(index, 1);
        else particle.update();
    });
}


// Generates a random number within a specified range
function randomNumber(min, max) { 
    return Math.random() * (max - min) + min;
} 

window.onload = init;