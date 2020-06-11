import { matrix, matrixMap } from "./utils";

export function init(mapWidth, mapHeight) {
  const map = matrix(mapWidth, mapHeight);
  let entities: Entity[][] = matrix(mapWidth, mapHeight, null);
  entities = matrixMap(entities, (e) => spawnItem(e, spawneable[0]));
  entities = matrixMap(entities, (e) => spawnItem(e, spawneable[1]));

  console.log(entities);

  return {
    map,
    entities,
  };
}

function spawnItem(e, item) {
  if (Math.random() <= item.spawnProbability) {
    return item;
  }
  return e;
}

const spawneable: Entity[] = [
  {
    name: "berry",
    spawnProbability: 0.2,
  },
  {
    name: "tree",
    spawnProbability: 0.3,
  },
];

class Entity {
  name: string;
  spawnProbability: number;
}
