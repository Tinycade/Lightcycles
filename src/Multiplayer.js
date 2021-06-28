// Create WebSocket connection.
//const socket = new WebSocket('ws://localhost:3000');
const socket = new WebSocket('ws://192.168.0.17:3000');

let socketID = '';
let connectedServer = false;
let roomKey = '';
let isHost = false;
let hostCallBack;
let joinCallback;
let playerNumber;

// Connection opened
socket.addEventListener('open', function (event) {
    connectedServer = true;
});

// parses an update sent from the host
function parseClientUpdate(packet) {
  switch(packet.type) {
    case 'START_GAME':
      players.forEach((player, index) => {
        if (player.connectedToServer) player.active = true;
      });
      gameState = 3;
      break;

    case 'PLAYER_JOIN':
      players[packet.playerNumber].connectedServer = true;
      break;

    case 'SYNC_STATE':
      players.forEach((player, index) => {
        if (index == playerNumber) return;

        let currentPlayer = packet.players[index];
        player.x = currentPlayer.x,
        player.y = currentPlayer.y,
        player.targetX = currentPlayer.targetX;
        player.targetY = currentPlayer.targetY;
        player.direction = currentPlayer.direction;
      });
      grid.cells = packet.grid;
      break;

    default: break;
  }
}

// client needs to
// send REQUEST_TO_JOIN with a room key entered and their socketID
// send UPDATE_HOST periodically with their socketID and varius state stuff

// Host needs to
// when client joins assigns them a playerID tied to their socketID -> send all clients the player ids when they join
// parse client updates and alter the state
// send UPDATE_CLIENT periodically with all the info

// Listen for messages
socket.addEventListener('message', function (event) {
    const packet = JSON.parse(event.data);

    switch (packet.type) {
      // server -> host
      case 'ROOM_IS_CREATED':
        roomKey = packet.roomKey;
        isHost = true;
        hostCallBack(roomKey);

        // Change to waiting room
        gameState = 1;
        players[0].connectedToServer = true;
        playerNumber = 0;
        isHost = true;
      break;

      case 'ASSIGN_SOCKET_ID':
        socketID = packet.payload;
      break;

      // client -> host
      case 'REQUEST_TO_JOIN':
        // HOST
        // assign player ID and forward on "CONFIRM_JOIN"
        // update player array
        const nextPlayer = players.findIndex(p => !p.connectedToServer);
        socket.send(createPacket('CONFIRM_JOIN', roomKey, { clientID: packet.payload, playerID: nextPlayer })); 
        players[nextPlayer].connectedToServer = true;
        sendMessage('UPDATE_CLIENT', { type: 'PLAYER_JOIN', playerNumber: nextPlayer }); 
      break;

      // client -> host
      case 'UPDATE_HOST':
        // HOST
        // UPDATE STATE FOR SPECIFIED PLAYER ID

        let currentPlayer = players[packet.payload.playerNumber];
        let trail = packet.payload.trail;

        for (let i = 0; i < trail.length; i++) {
            grid.setCell(currentPlayer.playerNumber, trail[i].x, trail[i].y);
        }

        currentPlayer.x = packet.payload.x;
        currentPlayer.y = packet.payload.y;
        currentPlayer.targetX = packet.payload.targetX;
        currentPlayer.targetY = packet.payload.targetY;
        currentPlayer.direction = packet.payload.direction;

        //currentPlayer.lerpTimer = players[0].lerpTimer;
      break;

      // host -> client
      case 'CONFIRM_JOIN':
        // CLIENT
        // make sure server is active
        players[0].connectedToServer = true;
        joinCallback(packet.roomKey, packet.payload.playerID);
        // MOVE TO HOSTED SCREEN
        // START RECIEVING HOST UPDATES
      break;

      // host -> client
      case 'UPDATE_CLIENT':
        // CLIENT
        // PARSE UPDATE FROM HOST
        parseClientUpdate(packet.payload);
      break;

      default:
        console.log(packet);
      break;
    }
});

function createPacket(type, roomKey, payload) {
    return JSON.stringify({
      type: type,
      roomKey: roomKey,
      payload: payload,
    });
  }

function hostGame(callBack) {
    if (!connectedServer) {
        throw "Client not connected to server yet";
        // Hide buttons for "Host and Join" until server is connected
    }

    socket.send(createPacket('CREATE_ROOM', '', ''));

    hostCallBack = callBack;
}

function joinRoom(room, callBack) {
    socket.send(createPacket('REQUEST_TO_JOIN', room, ''));
    joinCallback = callBack;
    roomKey = room;
}

function sendMessage(type, data) {
  socket.send(createPacket(type, roomKey, data));
}

function startGame() {
    // Removes any players that haven't joined
    players.forEach((player, index) => {
      if (player.connectedToServer) player.active = true;
    });
    gameState = 3;

    document.querySelector("#start-button").classList.add("hidden");

    // FIX LATER
    document.querySelector("#restart-button").classList.remove("hidden");

    sendMessage('UPDATE_CLIENT', {
      type: 'START_GAME',
    });
}

function sendHostUpdate() {
    
}

function sendClientUpdate() {
    
}