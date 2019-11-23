import { TileState, Coords, Direction } from "../lib/types"
import { Player } from "./player"
import { cloneDeep } from 'lodash';

/**
 * Deep copy function for TypeScript.
 * @param T Generic type of target/copied value.
 * @param target Target value to be copied.
 * @see Source project, ts-deepcopy https://github.com/ykdr2017/ts-deepcopy
 * @see Code pen https://codepen.io/erikvullings/pen/ejyBYg
 */
// export const deepCopy = <T>(target: T): T => {
//     if (target === null) {
//         return target;
//     }
//     else if (target instanceof Date) {
//         return new Date(target.getTime()) as any;
//     }
//     else if (target instanceof Array) {
//         const cp = [] as any[];
//         (target as any[]).forEach((v) => { cp.push(v); });
//         return cp.map((n: any) => deepCopy<any>(n)) as any;
//     }
//     //if (typeof target === 'object' && target !== {}) {
//     else {
//         const cp = { ...(target as { [key: string]: any }) } as { [key: string]: any };
//         Object.keys(cp).forEach(k => {
//             cp[k] = deepCopy<any>(cp[k]);
//         });
//         return cp as T;
//     }
//     return target;
// };

// function deepCopy<T>(o: T): T {
//     return JSON.parse(JSON.stringify(o));
// }

// export function deepClone<T>(obj: T): T {
//     const str = JSON.stringify(obj)
//     return JSON.parse(str) as T;
// }

export type Tiles<T = any> = T[][]
// make a generic spawn random function for any items, NPCs, obstacles, etc ?
export class World {
    tiles: Tiles<number>
    states: Tiles<TileState>
    tilesOriginal: Tiles<number>
    statesOriginal: Tiles<TileState>
    constructor(private mapSize: number) {
        this.tiles = [...Array(mapSize)].map(() => [...Array(mapSize)].map(() => Math.floor(Math.random() * 2) + 1)),
            this.states = [...Array(mapSize)].map(() => [...Array(mapSize)].map(() => { return new TileState() }))
        this.states = this.states.map((innerArray) => innerArray.map(val => {
            if (Math.random() > 0.9) {
                return { ...val, berries: 1 }
            } else {
                return val
            }
        }))
        this.tilesOriginal = cloneDeep(this.tiles)
        this.statesOriginal = cloneDeep(this.states)
    }
    reset() {
        this.tiles = cloneDeep(this.tilesOriginal)
        this.states = cloneDeep(this.statesOriginal)
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
