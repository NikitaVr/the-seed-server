import { TileState, Coords, Direction } from "../lib/types"
import { Player } from "./player"

export type Tiles<T = any> = T[][]
// make a generic spawn random function for any items, NPCs, obstacles, etc ?
export class World {
    tiles: Tiles<number>
    states: Tiles<TileState>
    constructor(private mapSize: number) {
        this.tiles = [...Array(mapSize)].map(() => [...Array(mapSize)].map(() => Math.floor(Math.random() * 2) + 1)),
        this.states = [...Array(mapSize)].map(() => [...Array(mapSize)].map(() => { return new TileState()}))
        this.states.forEach((innerArray) => innerArray.forEach(val => {
            if (Math.random() > 0.9) {
                return { ...val, berries: 1 }
            } else {
                return val
            }
        }))
    }
    getVisibleArea(position: Coords, radius: number) {
        return {
            tiles: getArea(this.tiles, position, radius),
            dynamic: getArea(this.states, position, radius)
        }
    }
    place(player: Player) {
        this.states[player.state.coords.x][player.state.coords.y].player = player.state
    }
    delete(player: Player) {
        this.states[player.state.coords.x][player.state.coords.y].player = null
    }
    move(player: Player, direction: Direction) {
        this.delete(player)
        player.move(direction)
        this.place(player)
    }
    useResource(player: Player) {
        const coords = player.state.coords
        if (this.states[coords.x][coords.y].berries) {
            this.states[coords.x][coords.y].berries = null
            player.state.food += 5; // add a cap at max food ...
        }
    }
}

function getArea<T>(tiles: Tiles<T>, position: Coords, radius: number) {
    const visible = tiles.slice(position.x - radius, position.x + radius + 1)
            .map(column => column.slice(position.y - radius, position.y + radius + 1)
        );
    return visible;
}
