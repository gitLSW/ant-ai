import Matter from "matter-js"
import Ant from "./entities/Ant";
import Rock from "./entities/Rock";
import Leaf from "./entities/Leaf";
import Ressource from './entities/Ressource';
import Spider from './entities/Spider';
import Anthill from "./entities/Anthill";
import Border from './entities/Border';
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


    // const levelHeight = 1000
    // const levelWidth = 1000

    // let width = 0.5
    // let frequency = 5
    // let chaos = 5

    // let north = []
    // let south = []
    // let west = []
    // let east = []
    // for (let i = 0; i < frequency * 10; i++) {
    //     if (Math.random() < 0.5) {
    //         north[i] = Math.random() / chaos
    //     }
    //     else {
    //         north[i] = -Math.random() / chaos
    //     }

    //     if (Math.random() < 0.5) {
    //         south[i] = Math.random() / chaos
    //     }
    //     else {
    //         south[i] = -Math.random() / chaos
    //     }

    //     if (Math.random() < 0.5) {
    //         west[i] = Math.random() / chaos
    //     }
    //     else {
    //         west[i] = -Math.random() / chaos
    //     }

    //     if (Math.random() < 0.5) {
    //         east[i] = Math.random() / chaos
    //     }
    //     else {
    //         east[i] = -Math.random() / chaos
    //     }
    // }

    // let posUp = north.length - 1
    // let posDown = south.length - 1


    // let horizontal = levelHeight / frequency
    // let min = 20
    // let max = 40
    // let up = max / 2
    // let down = max / 2

    // for (let i = 0; i < (levelWidth / width); i++) {

    //     if (i == 0 || i == (levelWidth / width) - 1) {
    //         let pos = south.length - 1
    //         let counter = max / 2
    //         for (let j = 0; j < (levelHeight / width); j++) {
    //             if (horizontal == 0 && pos > 0) {
    //                 pos--
    //                 horizontal = levelHeight / frequency
    //             }
    //             else {
    //                 horizontal--
    //             }


    //             if (j == 0 || j == (levelHeight / width) - 1) {
    //                 entities[`Border${i}_${j}`] = Border(world, { x: (i * width) + width / 2, y: (j * width) + width / 2 }, { width: width, height: width })
    //             }
    //             else if (i == (levelHeight / width) - 1) {
    //                 counter += east[pos]
    //                 if (counter < min) {
    //                     counter = min
    //                     pos--
    //                 }
    //                 else if (counter > max) {
    //                     counter = max
    //                     pos--

    //                 }
    //                 entities[`Border${i}_${j}`] = Border(world, { x: ((i + 1) * width) - counter / 2, y: (j * width) + width / 2 }, { width: counter, height: width })
    //             }
    //             else {
    //                 counter += west[pos]
    //                 if (counter < min) {
    //                     counter = min
    //                     pos--
    //                 }
    //                 else if (counter > max) {
    //                     counter = max
    //                     pos--

    //                 }
    //                 entities[`Border${i}_${j}`] = Border(world, { x: (i * width) + counter / 2, y: (j * width) + width / 2 }, { width: counter, height: width })
    //             }
    //         }
    //     } else {

    //         if (horizontal == 0 && posUp > 0 && posDown > 0) {
    //             posUp--
    //             posDown--
    //             horizontal = levelHeight / frequency
    //         }
    //         else {
    //             horizontal--
    //         }

    //         up += north[posUp]
    //         down += south[posDown]
    //         if (up < min) {
    //             up = min
    //             posUp--
    //         }
    //         else if (up > max) {
    //             up = max
    //             posUp--
    //         }

    //         if (down < min) {
    //             down = min
    //             posDown--
    //         }
    //         else if (down > max) {
    //             down = max
    //             posDown--
    //         }


    //         entities[`Border${i}_${0}`] = Border(world, { x: (i * width) + width / 2, y: up / 2 }, { width: width, height: up })
    //         entities[`Border${i}_${19}`] = Border(world, { x: (i * width) + width / 2, y: levelWidth - (down / 2) }, { width: width, height: down })
    //     }
    // }

    return {
        ...entities,
        Camera: { position: { x: 0, y: 0 } }
    }
}