import Matter from "matter-js"
import Ant from "./entities/Ant";
import Floor from "./entities/Floor";
import Obstacle from "./entities/Obstacle";
import Ressource from './entities/Ressource';
import Enemy from './entities/Enemy';
import { getRandomCoordiante } from "./utils/random";

const levelHeight = 400
const levelWidth = 400

export default restart => {
    let engine = Matter.Engine.create({ enableSleeping: false })

    let world = engine.world

    world.gravity.y = 0

    const entities = {
        physics: { engine, world },
        NorthBorder: Floor(world, 'brown', { x: levelWidth / 2, y: 0 }, { height: 50, width: levelWidth }),
        EastBorder: Floor(world, 'brown', { x: levelWidth, y: levelHeight / 2 }, { height: levelHeight, width: 50 }),
        SouthBorder: Floor(world, 'brown', { x: levelWidth / 2, y: levelHeight }, { height: 50, width: levelWidth }),
        WestBorder: Floor(world, 'brown', { x: 0, y: levelHeight / 2 }, { height: levelHeight, width: 50 })
    }

    const antSize = { height: 8, width: 8 }
    const colonyPos = { x: levelWidth / 2, y: levelHeight / 2 }
    // for (let index = 1; index <= 15; index++) {
        entities[`Ant${1}`] = Ant(world, 'green', colonyPos, antSize)
    // }

    const levelSize = { width: levelWidth, height: levelHeight }

    const spiderSize = { width: 15, height: 15 }
    for (let index = 1; index <= 7; index++) {
        entities[`Spider${index}`] = Enemy(world, 'red', getRandomCoordiante(levelSize), spiderSize)
    }

    const obstacleSize = { width: 50, height: 50 }
    for (let index = 1; index <= 10; index++) {
        entities[`Obstacle${index}`] = Obstacle(world, 'Obstacle', 'black', getRandomCoordiante(levelSize), obstacleSize)
    }

    const ressourceSize = { width: 12, height: 12 }
    for (let index = 1; index <= 5; index++) {
        entities[`Ressource${index}`] = Ressource(world, 'Ressource', 'yellow', getRandomCoordiante(levelSize), ressourceSize)
    }

    return {
        ...entities,
        Camera: { position: colonyPos }
    }
}