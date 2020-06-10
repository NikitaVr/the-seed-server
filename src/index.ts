require('dotenv').config();
import moment from 'moment';
import express from 'express';
import http from 'http';
import WebSocket from 'ws'

const config = {
  port: Number(process.env['port']) | 8080,
  interval: 2000,
}
const app = express();
const server = http.createServer(app);

const wsServer = new WebSocket.Server({server})

wsServer.on('connection', (ws) => {
  ws.on('message', (inMsg) => {
    console.info(`>in ${moment().toISOString()} ${JSON.stringify(inMsg)}`);
  })

  const msgInterval = setInterval(() => {
    const outMsg = JSON.stringify({ time: moment().toISOString() })
    ws.send(outMsg);
  }, config.interval);

  ws.on('close', () => {
    clearInterval(msgInterval);   
  })
})

server.listen(config.port, () => {
  console.log(`Server started on port ${config.port}`);
});
