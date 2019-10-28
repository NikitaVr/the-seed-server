var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
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

var world = [
    1, 3, 3, 3, 1, 1, 3, 1,
    1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 2, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 2, 1, 1, 1, 1,
    1, 1, 1, 1, 2, 1, 1, 1,
    1, 1, 1, 1, 2, 1, 1, 1,
    1, 1, 1, 1, 2, 1, 1, 1
] // can access specific element by (x * rowSize + y) ?????

function modifyWorld() {
    console.log('Cant stop me now!');
    world[Math.floor(Math.random() * world.length)] = Math.floor(Math.random() * 3) + 1; // sets random tile to random integer from 1 to 3 inclusive
    io.emit('get proximity', world);
}

setInterval(modifyWorld, 1500);

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
    // socket.on('get proximity', function (msg) {
    //     io.emit('get proximity', world);
    // });
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