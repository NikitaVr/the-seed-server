import { Direction } from './../lib/types';
import uuidv1 from 'uuid/v4'; 
import socketIO from 'socket.io'
import { Hash, Coords } from '../lib/types';

export class PlayerState{
    constructor(public coords: Coords, public food: number) {}
}

export class Player {
    id = uuidv1();
    constructor(public socket: socketIO.Socket, public state: PlayerState) { }
    move(direction: Direction) {
        switch (direction) {
            case Direction.Up:
                break
            case Direction.Down:
                break
            case Direction.Left:
                break
            case Direction.Right:
                this.state.coords.x++
                break
        }
    }
}

export interface Players extends Hash<Player>{}
