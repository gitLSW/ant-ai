import Matter from "matter-js"
import Ant from "./entities/Ant";
import Rock from "./entities/Rock";
import Leaf from "./entities/Leaf";
import Ressource from './entities/Ressource';
import Spider from './entities/Spider';
import { getRandomCoordiante } from "./utils/random";

const levelHeight = 1000
const levelWidth = 1000

export default restart => {
    let engine = Matter.Engine.create({ enableSleeping: false })

    let world = engine.world

    world.gravity.y = 0

    const entities = {
        physics: { engine, world },
        // NorthBorder: Obstacle(world, { x: levelWidth / 2, y: 0 }, { height: 50, width: levelWidth }),
        // EastBorder: Obstacle(world, { x: levelWidth, y: levelHeight / 2 }, { height: levelHeight, width: 50 }),
        // SouthBorder: Obstacle(world, { x: levelWidth / 2, y: levelHeight }, { height: 50, width: levelWidth }),
        // WestBorder: Obstacle(world, { x: 0, y: levelHeight / 2 }, { height: levelHeight, width: 50 })
    }

    const antSize = { height: 8, width: 8 }
    const colonyPos = { x: levelWidth / 2, y: levelHeight / 2 }
    // for (let index = 1; index <= 15; index++) {
        entities[`Ant${1}`] = Ant(world, colonyPos, antSize)
    // }

    const levelSize = { width: levelWidth, height: levelHeight }

    const spiderSize = { width: 15, height: 15 }
    for (let index = 1; index <= 7; index++) {
        entities[`Spider${index}`] = Spider(world, getRandomCoordiante(levelSize), spiderSize)
    }

    const obstacleSize = { width: 50, height: 50 }
    for (let index = 1; index <= 5; index++) {
        entities[`Rock${index}`] = Rock(world, getRandomCoordiante(levelSize), obstacleSize)
    }

    for (let index = 1; index <= 5; index++) {
        entities[`Leaf${index}`] = Leaf(world, getRandomCoordiante(levelSize), obstacleSize)
    }

    const ressourceSize = { width: 12, height: 12 }
    for (let index = 1; index <= 5; index++) {
        entities[`Ressource${index}`] = Ressource(world, 'Ressource', getRandomCoordiante(levelSize), ressourceSize)
    }

    return {
        ...entities,
        Camera: { position: { x: 0, y: 0 } }
    }
}