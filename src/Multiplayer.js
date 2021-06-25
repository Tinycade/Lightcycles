// Create WebSocket connection.
//const socket = new WebSocket('ws://localhost:3000');
const socket = new WebSocket('ws://192.168.0.6:3000');

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
        playerNumber = nextPlayer + 1;
      break;

      // client -> host
      case 'UPDATE_HOST':
        // HOST
        // UPDATE STATE FOR SPECIFIED PLAYER ID

        socket.send(createPacket('UPDATE_CLIENT', roomKey, {
            player1X: players[0].drawX,
            player1Y: players[0].drawY,
            cells: grid,
        }))
      break;

      // host -> client
      case 'CONFIRM_JOIN':
        // CLIENT
        // RECIEVE PLAYER ID
        joinCallback(packet.roomKey, packet.payload.playerID);
        // MOVE TO HOSTED SCREEN
        // START RECIEVING HOST UPDATES
      break;

      // host -> client
      case 'UPDATE_CLIENT':
        // CLIENT
        // PARSE UPDATE FROM HOST
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
    }

    socket.send(createPacket('CREATE_ROOM', '', ''));

    hostCallBack = callBack;
}

function joinRoom(roomKey, callBack) {
    socket.send(createPacket('REQUEST_TO_JOIN', roomKey, ''));
    joinCallback = callBack;
}

function startGame() {
    // Removes any players that haven't joined
    players.forEach((player, index) => {
      if (player.connectedToServer) player.active = true;
    });
    gameState = 3;
}

function sendHostUpdate() {
    
}

function sendClientUpdate() {
    
}