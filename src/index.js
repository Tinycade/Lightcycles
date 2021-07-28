// Defines grid and canvas
let canvas, ctx;
let grid;

// Defines Beholder detection
const Beholder = window['beholder-detection'];

// Defines the game state and players
let gameState = 0;
const players = [];
let winner = 0;

// Creates "Host Room" and "Join Room" buttons
let buttons = [];
let elem = document.getElementById("myCanvas");
canvasLeft = elem.offsetLeft + elem.clientLeft;
canvasTop = elem.offsetTop + elem.clientTop;

// Creates particles when a player crashes
let particles = [];

let updateTimer = 30;
function sendFixedUpdate() {
    updateTimer -= dt;

    if (updateTimer < 0) {
        updateTimer = 100;

        if (isHost) {
            // send host update
            const data = {
                type: 'SYNC_STATE',
                players: [
                    {
                        x: players[0].x,
                        y: players[0].y,
                        targetX: players[0].targetX,
                        targetY: players[0].targetY,
                        direction: players[0].direction,
                        lerpTimer: players[0].lerpTimer,
                        gameOver: players[0].gameOver,
                    },
                    {
                        x: players[1].x,
                        y: players[1].y,
                        targetX: players[1].targetX,
                        targetY: players[1].targetY,
                        direction: players[1].direction,
                        lerpTimer: players[1].lerpTimer,
                        gameOver: players[1].gameOver,
                    },
                    {
                        x: players[2].x,
                        y: players[2].y,
                        targetX: players[2].targetX,
                        targetY: players[2].targetY,
                        direction: players[2].direction,
                        lerpTimer: players[2].lerpTimer,
                        gameOver: players[2].gameOver,
                    },
                    {
                        x: players[3].x,
                        y: players[3].y,
                        targetX: players[3].targetX,
                        targetY: players[3].targetY,
                        direction: players[3].direction,
                        lerpTimer: players[3].lerpTimer,
                        gameOver: players[3].gameOver,
                    },
                ],
                grid: grid.cells,
              };
      
              sendMessage('UPDATE_CLIENT', data);
        } else {
            // send client update
            let currentPlayer = players[playerNumber];

            const data = {
                playerNumber: playerNumber,
                x: currentPlayer.x,
                y: currentPlayer.y,
                targetX: currentPlayer.targetX,
                targetY: currentPlayer.targetY,
                trail: currentPlayer.trail,
                direction: currentPlayer.direction,
                gameOver: currentPlayer.gameOver,
            }
            
            sendMessage('UPDATE_HOST', data);
        }
    }
}

function mainUpdate() {
    // Update players and grid
    players.forEach((p) => p.update(dt));
    grid.update(dt);

    sendFixedUpdate();
}


function init() {
    canvas = document.getElementById("myCanvas");
    canvas.width = 480;
    canvas.height = 480;
    ctx = canvas.getContext("2d");

    Beholder.init('#beholder-root', { overlay_params: {present: false}, camera_params: {rearCamera: true, torch: true, videoSize: 0}});

    // Initializes the grid
    grid = new Grid();

    // Initializes players
    players.push(new Lightcycle(1, 1, "right", 0, grid));
    players.push(new Lightcycle(cellCount - 2, 1, "left", 1, grid));
    players.push(new Lightcycle(1, cellCount/2, "right", 2, grid));
    players.push(new Lightcycle(cellCount - 2, cellCount/2, "left", 3, grid));

    // REMOVE LATER
    document.addEventListener("keydown", (e) => { 
        if (gameState == 3 && players[playerNumber].active) {
            players[playerNumber].changeDirection(e); 
            players[playerNumber].changeWall(e); 
        }
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
        gameState = 1;
    });

    document.getElementById("join-button").addEventListener("click", () => {
        joinRoom(
            document.getElementById('room-field').value.toUpperCase(),
            (key, playerID) => {
                document.querySelector("#join-screen").classList.add("hidden");
                document.querySelector("#host-screen").classList.remove("hidden");
                document.querySelector("#room-code").innerHTML = key;
                gameState = 2;

                playerNumber = playerID;
                players[playerNumber].connectedToServer = true;
            }
        )
    });

    document.getElementById("start-button").addEventListener("click", startGame);

    document.getElementById("restart-button").addEventListener("click", () => {
        // Reset players for a new round
        sendMessage('UPDATE_CLIENT', { type: 'RESET_STATE' }); 
        grid.resetCells();
        players.forEach((p) => {
            p.reset();
        });
    });

    // Resize canvas
    window.addEventListener('resize', resizeGame, false);
    window.addEventListener('orientationchange', resizeGame, false);

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
    let wallMarker = Beholder.getMarker(5); 
    
    let leftMarker = Beholder.getMarker(1);
    let rightMarker = Beholder.getMarker(2);
    let upMarker = Beholder.getMarker(3);
    let downMarker = Beholder.getMarker(4);

    // Check for player movement
    if (leftMarker.present) players[playerNumber].changeDirection("Left");
    if (rightMarker.present) players[playerNumber].changeDirection("Right");
    if (upMarker.present) players[playerNumber].changeDirection("Up");
    if (downMarker.present) players[playerNumber].changeDirection("Down");

    // Check for player wall toggle
    if (!wallMarker.present && players[playerNumber].wall) {
        players[playerNumber].changeWall("Wall Off");
    }

    if (wallMarker.present && !players[playerNumber].wall) {
        players[playerNumber].changeWall("Wall On");
    } 

    // Removes any players that haven't joined
    players.forEach((player, index) => {
        if (player.connectedToServer) player.active = true;
      });

    // Check to see if all players have crashed except for one
    let playersAlive = 0;
    let playersActive = 0;
    players.forEach((p) => { if(!p.gameOver) playersAlive++ });
    players.forEach((p) => { if(p.active) playersActive++ });

    if (playersAlive > 1) document.querySelector("#restart-button").classList.add("hidden");

    if (playersActive > 1) {
        if (playersAlive == 1) {
            // Determine the winner
            players.forEach((p) => {
                if (!p.gameOver && p.active) winner = p;
            });
            console.log("Player " + (winner.playerNumber + 1) + " wins!");
            if (isHost) document.querySelector("#restart-button").classList.remove("hidden");
        } else if (playersAlive == 0) {
            winner = players[0];
            console.log("No one wins!");
            if (isHost) document.querySelector("#restart-button").classList.remove("hidden");
        }
    } else {
        // For single-player testing purposes
        if (isHost) document.querySelector("#restart-button").classList.remove("hidden"); 
    }

    draw();
    requestAnimationFrame(update);
}


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 1;

    // Main screen or "Join Room" screen
    if (gameState <= 1) {
        let logo = document.getElementById("logo");
        ctx.drawImage(logo, 0, 100, canvas.width, canvas.width/3);
    }
    // Lobby before the game starts
    else if (gameState == 2) {
        let padding = 10; 
        let spriteSize = (canvas.width/2)-(padding*2);

        let player1 = document.getElementById("player1");
        let player2 = document.getElementById("player2");
        let player3 = document.getElementById("player3");
        let player4 = document.getElementById("player4");

        if (players[0].active) ctx.drawImage(player1, padding*2, padding*3, spriteSize, spriteSize);
        if (players[1].active) ctx.drawImage(player2, canvas.width/2, padding*3, spriteSize, spriteSize);
        if (players[2].active) ctx.drawImage(player3, padding*2, canvas.width/2 - padding, spriteSize, spriteSize);
        if (players[3].active) ctx.drawImage(player4, canvas.width/2, canvas.width/2 - padding, spriteSize, spriteSize);
    }
    // In-game
    else if (gameState > 2) {
        mainUpdate();
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


// Resizes the canvas to fit any browser window
function resizeGame() {
    var gameCanvas = document.getElementById('myCanvas');
    var widthToHeight = 4 / 3;
    var newWidth = window.innerWidth;
    var newHeight = window.innerHeight;
    var newWidthToHeight = newWidth / newHeight;
    
    if (newWidthToHeight > widthToHeight) {
        newWidth = newHeight * widthToHeight;
        gameCanvas.style.height = newHeight + 'px';
        gameCanvas.style.width = newWidth + 'px';
    } else {
        newHeight = newWidth / widthToHeight;
        gameCanvas.style.width = newWidth + 'px';
        gameCanvas.style.height = newHeight + 'px';
    }
    
    gameCanvas.style.marginTop = (-newHeight / 2) + 'px';
    gameCanvas.style.marginLeft = (-newWidth / 2) + 'px';

    gameCanvas.width = newWidth;
    gameCanvas.height = newHeight;
}

window.onload = init;