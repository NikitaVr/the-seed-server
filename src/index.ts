import express from 'express'
const app = express();
import {Server} from 'http'
const http = new Server(app);
import socketIO from 'socket.io'
const ioServer = socketIO(http);
import uuidv1 from 'uuid/v4'; 

const port = process.env.PORT || 3000;

const mapSize = 100;

const rowSize = 9;

class tyleState{
    player?: any
    berries?:any
}

const world = {
    tiles: [...Array(mapSize)].map(() => [...Array(mapSize)].map(() => Math.floor(Math.random() * 2) + 1)),
    dynamic: [...Array(mapSize)].map(() => [...Array(mapSize)].map(() => { return new tyleState()}))
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

export interface Hash<T = any> {
    [key: string]: T
}

interface Players extends Hash<Player>{}
const players: Players = {}

let actions = {}

function getVisibleArea(array: any[][], x: number, y: number) {
    const visible = array.slice(x - 4, x + 5).map(column => {
        return column.slice(y - 4, y + 5);
    });
    return visible;
}

function getPlayerVision(key: string) {
    const player = getPlayer(key)
    const response = {
        tiles: getVisibleArea(world.tiles, player.state.coords.x, player.state.coords.y),
        dynamic: getVisibleArea(world.dynamic, player.state.coords.x, player.state.coords.y)
    }
    return response
}

function getPlayer(key: string) {
    return players[key]
}

function getPlayerCoords(key: string) {
    return getPlayer(key).state.coords
}


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
        getPlayer(key).state.food -= 1;
        switch (actions[key].type) {
            case "move":
                switch (actions[key].direction) {
                    case "right":
                        console.log("MOVE RIGHT")
                        //if (players[key].player.coords.x < rowSize - 1) {
                        delete world.dynamic[getPlayerCoords(key).x][getPlayerCoords(key).y].player
                        players[key].state.coords.x += 1;
                        world.dynamic[getPlayerCoords(key).x][getPlayerCoords(key).y] = { ...world.dynamic[getPlayerCoords(key).x][getPlayerCoords(key).y], player: getPlayer(key).state }
                        //}
                        break;
                    default:
                        break;
                }
                break;
            case "use ground item":
                if (world.dynamic[getPlayerCoords(key).x][getPlayerCoords(key).y].berries) {
                    delete world.dynamic[getPlayerCoords(key).x][getPlayerCoords(key).y].berries
                    getPlayer(key).state.food += 5; // add a cap at max food ...
                }
                break;
            default:
                break;
        }
    }
    actions = {}
    //io.emit('get proximity', world);
    for (var key in players) {
        if (getPlayer(key).state.food <= 0) {
            players[key].socket.emit('dead of hunger')
            players[key].socket.disconnect(true)
            delete players[key] // make this whole death thing into separate function? with different reasons for death?
            console.log("DEAD")
        } else {
            players[key].socket.emit('get proximity', getPlayerVision(key))
        }

    }
}

setInterval(processActions, 1000); // process actions every 1 second

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

interface Coordinates{
    x: number
    y: number
}
class PlayerState{
    constructor(public coords: Coordinates, public food: number) {}
}
class Player {
    id = uuidv1();
    constructor(public socket: socketIO.Socket, public state: PlayerState) { }
}

ioServer.on('connection', function (socket: any) {
    const player = new Player(socket, new PlayerState({x:20, y:20}, 10))
    players[player.id] = player
    world.dynamic[20][20] = { player: player.state };
    socket.on('action', function (action) {
        actions[player.id] = action
        console.log(actions)
    });
    player.socket.emit('get proximity', getPlayerVision(player.id))
});

http.listen(port, function () {
    console.log('listening on *:' + port);
});