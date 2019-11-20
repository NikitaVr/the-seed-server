import { World } from './model/world';
import express from 'express'
const app = express();
import { Server } from 'http'
const http = new Server(app);
import socketIO from 'socket.io'
const ioServer = socketIO(http);
import { Player, Players, PlayerState } from './model/player';
import { Direction } from './lib/types';

require('dotenv').config()

const port = process.env.PORT || 3000;

const mapSize = 100;
const radius = 4
const rowSize = 9;


const map = new World(mapSize)

const players: Players = {}

let actions = {}

function getPlayerVision(key: string) {
    const player = getPlayer(key)
    const result = map.getVisibleArea(player.state.coords, radius)
    return result
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
        const player = getPlayer(key)
        player.state.food -= 1;
        switch (actions[key].type) {
            case "move":
                switch (actions[key].direction) {
                    case "right":
                        console.log("MOVE RIGHT")
                        map.move(player, Direction.Right)
                        break;
                    default:
                        break;
                }
                break;
            case "use ground item":
                map.useResource(player)
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
            map.delete(players[key])
            delete players[key] // make this whole death thing into separate function? with different reasons for death?
            console.log("DEAD")
        } else {
            players[key].socket.emit('get proximity', getPlayerVision(key))
        }

    }
}

if (process.env.WAIT_FOR_PLAYERS == 'false') {
    setInterval(processActions, parseInt(process.env.STEP_TIME) || 1000); // process actions every STEP_TIME, default to 1 second
}

function compareKeys(a, b) {
    var aKeys = Object.keys(a).sort();
    var bKeys = Object.keys(b).sort();
    return JSON.stringify(aKeys) === JSON.stringify(bKeys);
}


app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});


ioServer.on('connection', function (socket: any) {
    const player = new Player(socket, new PlayerState({ x: 20, y: 20 }, 30))
    players[player.id] = player
    map.place(player)
    socket.on('action', function (action) {
        actions[player.id] = action
        console.log(actions)

        if (process.env.WAIT_FOR_PLAYERS == 'true') {
            // compare if all players have submitted actions
            if (compareKeys(players, actions)) {
                processActions()
            }
        }

    });
    player.socket.emit('get proximity', getPlayerVision(player.id))
});

http.listen(port, function () {
    console.log('listening on *:' + port);
});