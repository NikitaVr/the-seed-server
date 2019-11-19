import { PlayerState } from './../model/player';
export class TileState{
    player?: PlayerState
    berries?: number
}

export interface Hash<T = any> {
    [key: string]: T
}

export interface Coords {
    x: number
    y: number
}

export enum Direction {
    Up = 1,
    Down,
    Left,
    Right,
}