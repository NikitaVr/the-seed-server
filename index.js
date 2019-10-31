var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const uuidv1 = require('uuid/v4');
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
    dynamic: [...Array(mapSize)].map((innerArray) => [...Array(mapSize)].fill({}))
}

// make a generic spawn random function for any items, NPCs, obstacles, etc ?
function spawnBerries() {
    world.dynamic = world.dynamic.map((innerArray) => innerArray.map(val => {
        if (Math.random() > 0.9) {
            return { ...val, berries: 1 }
        } else {
            return val
        }

    }))
}

spawnBerries()

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
    const player = getPlayer(key)
    const response = {
        tiles: withinVisionSlice(world.tiles, player.coords.x, player.coords.y),
        dynamic: withinVisionSlice(world.dynamic, player.coords.x, player.coords.y)
    }
    return response
}

function getPlayer(key) {
    return players[key].player
}

function getPlayerCoords(key) {
    return getPlayer(key).coords
}



// function movePlayerLeft(key) {
//     delete world.dynamic[players[key].player.coords.x][players[key].player.coords.y].player
//     players[key].player.coords.x -= 1
//     world.dynamic[players[key].player.coords.x][players[key].player.coords.y].player = players[key].player
// }

// function movePlayerRight(key) {
//     delete world.dynamic[players[key].player.coords.x][players[key].player.coords.y].player
//     players[key].player.coords.x += 1
//     world.dynamic[players[key].player.coords.x][players[key].player.coords.y].player = players[key].player
// }

// function movePlayerUp(key) {
//     delete world.dynamic[players[key].player.coords.x][players[key].player.coords.y].player
//     players[key].player.coords.x += 1
//     world.dynamic[players[key].player.coords.x][players[key].player.coords.y].player = players[key].player
// }

// function movePlayerDown(key) {

// }


// make an item class ? 
/*

{
    name: "berries",
    effect: function(playerKey???)...
}

*/


function processActions() {
    console.log('Processing Actions');
    console.log(actions)
    for (var key in actions) {
        getPlayer(key).food -= 1;
        switch (actions[key].type) {
            case "move":
                switch (actions[key].direction) {
                    case "right":
                        console.log("MOVE RIGHT")
                        //if (players[key].player.coords.x < rowSize - 1) {
                        delete world.dynamic[getPlayerCoords(key).x][getPlayerCoords(key).y].player
                        players[key].player.coords.x += 1;
                        world.dynamic[getPlayerCoords(key).x][getPlayerCoords(key).y] = { ...world.dynamic[getPlayerCoords(key).x][getPlayerCoords(key).y], player: getPlayer(key) }
                        //}
                        break;
                    default:
                        break;
                }
                break;
            case "use ground item":
                if (world.dynamic[getPlayerCoords(key).x][getPlayerCoords(key).y].berries) {
                    delete world.dynamic[getPlayerCoords(key).x][getPlayerCoords(key).y].berries
                    getPlayer(key).food += 5; // add a cap at max food ...
                }
                break;
            default:
                break;
        }
    }
    actions = {}
    //io.emit('get proximity', world);
    for (var key in players) {
        if (getPlayer(key).food <= 0) {
            players[key].emit('dead of hunger')
            players[key].conn.close()
            delete players[key] // make this whole death thing into separate function? with different reasons for death?
            console.log("DEAD")
        } else {
            players[key].emit('get proximity', getPlayerVision(key))
        }

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
        },
        food: 10
    }
    players[id] = socket
    world.dynamic[20][20] = { player: socket.player };
    socket.on('action', function (msg) {
        actions[socket.player.id] = msg
    });
    players[id].emit('get proximity', getPlayerVision(id))
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