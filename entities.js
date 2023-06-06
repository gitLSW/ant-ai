import Matter from "matter-js"
import Ant from "./entities/Ant";
import Rock from "./entities/Rock";
import Leaf from "./entities/Leaf";
import Ressource from './entities/Ressource';
import Spider from './entities/Spider';
import Anthill from "./entities/Anthill";
import { getRandom, getRandomCoordiante } from "./utils/random";

export default worldSize => {
    let engine = Matter.Engine.create({ enableSleeping: false })

    let world = engine.world

    world.gravity.y = 0

    const entities = {
        physics: { engine, world },
        // NorthBorder: Obstacle(world, { x: worldSize.width / 2, y: 0 }, { height: 50, width: worldSize.width }),
        // EastBorder: Obstacle(world, { x: worldSize.width, y: worldSize.height / 2 }, { height: worldSize.height, width: 50 }),
        // SouthBorder: Obstacle(world, { x: worldSize.width / 2, y: worldSize.height }, { height: 50, width: worldSize.width }),
        // WestBorder: Obstacle(world, { x: 0, y: worldSize.height / 2 }, { height: worldSize.height, width: 50 })
    }

    const obstacleSize = { width: 50, height: 50 }
    const spiderSize = { width: 45, height: 45 }
    const resourceSize = { width: 50, height: 50 }
    let rockIndex = 0
    let spiderIndex = 0
    let resourceIndex = 0
    let leafIndex = 0
    for (let i = 0; i < 150; i++) {
        let random = getRandom(0, 10)
        if ((random == 1 || random == 2)) {
            const rock = Rock(world, getRandomCoordiante(worldSize), obstacleSize, rockIndex)
            entities[rock.body.label] = rock
            rockIndex++
        }
        else if (random == 3) {
            const spider = Spider(world, getRandomCoordiante(worldSize), spiderSize, spiderIndex)
            entities[spider.body.label] = spider
            spiderIndex++
        }
        else if (random == 4) {
            const leaf = Leaf(world, getRandomCoordiante(worldSize), obstacleSize, leafIndex)
            entities[leaf.body.label] = leaf
            leafIndex++
        }
        else if (random == 5) {
            const ressource = Ressource(world, getRandomCoordiante(worldSize), resourceSize, resourceIndex)
            entities[ressource.body.label] = ressource
            resourceIndex++
        }
    }

    const antSize = { height: 8, width: 8 }
    const anthillPos = { x: worldSize.width / 2, y: worldSize.height / 2 }

    entities[`Hill`] = Anthill(world, anthillPos, { height: 200, width: 200 }, 1)

    // for (let index = 1; index <= 15; index++) {
            const ant = Ant(world, anthillPos, antSize, 0)
            entities[ant.body.label] = ant
    // }  

    return {
        ...entities,
        Camera: { position: { x: 0, y: 0 } }
    }
}