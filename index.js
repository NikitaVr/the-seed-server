var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const uuidv1 = require('uuid/v1'); // timestamp based uuid
var port = process.env.PORT || 3000;

// var world = [
//     [
//         { tile: 0 },
//         { tile: 0 }
//     ],
//     [
//         { tile: 0 },
//         { tile: 1 }
//     ]
// ]

const rowSize = 8;

var world = {
    tiles: [
        1, 2, 2, 2, 1, 1, 2, 1,
        1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 2, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 2, 1, 1, 1, 1,
        1, 1, 1, 1, 2, 1, 1, 1,
        1, 1, 1, 1, 2, 1, 1, 1,
        1, 1, 1, 1, 2, 1, 1, 1
    ], // can access specific element by (y * rowSize + x) ?????
    dynamic: [
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 3, 0, 0, 3, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        3, 0, 0, 0, 0, 0, 3, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 3, 0, 0, 0
    ]
}

var players = {}

var actions = {}

function modifyWorld() {
    console.log('Cant stop me now!');
    //world[Math.floor(Math.random() * world.length)] = Math.floor(Math.random() * 3) + 1; // sets random tile to random integer from 1 to 3 inclusive
    io.emit('get proximity', world);
}

function processActions() {
    console.log('Processing Actions');
    console.log("PLAYERS -----------------------------------------------------------")
    console.log(players)
    console.log("ACTIONS -----------------------------------------------------------")
    console.log(actions)
    for (var key in actions) {
        if (actions[key].type === "move") {
            if (actions[key].direction === "right") {
                if (players[key].player.coords.x < rowSize - 1) {
                    console.log("MOVING +++++++++++++++++++++++++++++++++++++++++++++++++++++")
                    world.dynamic[players[key].player.coords.y * rowSize + players[key].player.coords.x] = 0
                    players[key].player.coords.x += 1
                    world.dynamic[players[key].player.coords.y * rowSize + players[key].player.coords.x] = 6
                }
            }
        }
    }
    actions = {}
    io.emit('get proximity', world);
}

//setInterval(modifyWorld, 1500);

setInterval(processActions, 1500);

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
    const id = uuidv1();
    socket.player = {
        id: id,
        coords: {
            x: 2,
            y: 2
        }
    }
    players[id] = socket
    socket.on('action', function (msg) {
        actions[socket.player.id] = msg
    });
});

// io.on('connection', function (socket) {
//     socket.on('chat message', function (msg) {
//         io.emit('chat message', msg);
//     });
//     socket.on('A', function (something) {
//         // we just received a message
//         // let's respond to *that* client :
//         socket.emit('B', somethingElse);
//     });
// });

http.listen(port, function () {
    console.log('listening on *:' + port);
});