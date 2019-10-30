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

mapSize = 100;

const rowSize = 9;

// var world = {
//     tiles: [
//         1, 2, 2, 2, 1, 1, 2, 1,
//         1, 1, 1, 1, 1, 1, 1, 1,
//         1, 1, 1, 1, 1, 2, 1, 1,
//         1, 1, 1, 1, 1, 1, 1, 1,
//         1, 1, 1, 2, 1, 1, 1, 1,
//         1, 1, 1, 1, 2, 1, 1, 1,
//         1, 1, 1, 1, 2, 1, 1, 1,
//         1, 1, 1, 1, 2, 1, 1, 1
//     ], // can access specific element by (y * rowSize + x) ?????
//     dynamic: [
//         0, 7, 0, 0, 0, 0, 0, 0,
//         0, 0, 3, 0, 0, 3, 0, 0,
//         0, 0, 0, 0, 0, 0, 7, 0,
//         0, 0, 0, 0, 0, 0, 0, 0,
//         0, 0, 0, 0, 0, 0, 0, 0,
//         3, 0, 0, 0, 0, 0, 3, 0,
//         0, 7, 0, 0, 0, 0, 7, 0,
//         0, 0, 0, 0, 3, 0, 0, 0
//     ]
// }

var world = {
    tiles: [...Array(mapSize)].map((innerArray) => [...Array(mapSize)].map((val) => Math.floor(Math.random() * 2) + 1)),
    dynamic: [...Array(mapSize)].map((innerArray) => [...Array(mapSize)].fill(0))
}

var players = {}

var actions = {}

function modifyWorld() {
    console.log('Cant stop me now!');
    //world[Math.floor(Math.random() * world.length)] = Math.floor(Math.random() * 3) + 1; // sets random tile to random integer from 1 to 3 inclusive
    io.emit('get proximity', world);
}

function withinVisionSlice(array, x, y) {
    const withinVision = array.slice(x - 4, x + 5).map(function (column) { return column.slice(y - 4, y + 5); });
    return withinVision;
}

function getPlayerVision(key) {
    const { player } = players[key]
    return {
        tiles: withinVisionSlice(world.tiles, player.coords.x, player.coords.y),
        dynamic: withinVisionSlice(world.dynamic, player.coords.x, player.coords.y)
    }

}



// function movePlayerLeft(key) {
//     if (players[key].player.coords.x < rowSize - 1) {
//         world.dynamic[players[key].player.coords.y * rowSize + players[key].player.coords.x] = 0
//         players[key].player.coords.x += 1
//         world.dynamic[players[key].player.coords.y * rowSize + players[key].player.coords.x] = 6
//     }
// }

// function movePlayerRight(key) {
//     if (players[key].player.coords.x < rowSize - 1) {
//         world.dynamic[players[key].player.coords.y * rowSize + players[key].player.coords.x] = 0
//         players[key].player.coords.x += 1
//         world.dynamic[players[key].player.coords.y * rowSize + players[key].player.coords.x] = 6
//     }
// }

// function movePlayerUp(key) {

// }

// function movePlayerDown(key) {

// }



function processActions() {
    console.log('Processing Actions');
    console.log(actions)
    for (var key in actions) {
        switch (actions[key].type) {
            case "move":
                switch (actions[key].direction) {
                    case "right":
                        console.log("MOVE RIGHT")
                        //if (players[key].player.coords.x < rowSize - 1) {
                        world.dynamic[players[key].player.coords.x][players[key].player.coords.y] = 0
                        players[key].player.coords.x += 1
                        world.dynamic[players[key].player.coords.x][players[key].player.coords.y] = 6
                        //}
                        break;
                    default:
                        break;
                }
                break;
            default:
                break;
        }

        if (actions[key].type === "move") {
            if (actions[key].direction === "right") {

            }
        }
    }
    actions = {}
    //io.emit('get proximity', world);
    for (var key in players) {
        players[key].emit('get proximity', getPlayerVision(key))
    }
}

//setInterval(modifyWorld, 1500);

setInterval(processActions, 1000);

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
    const id = uuidv1();
    socket.player = {
        id: id,
        coords: {
            x: 20,
            y: 20
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