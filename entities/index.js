import Matter from "matter-js"
import Ant from "../components/Ant";
import Floor from "../components/Floor";
import Obstacle from "../components/Obstacle";
import Ressource from '../components/Ressource';
import Enemy from '../components/Enemy';

import { Dimensions } from 'react-native'
// import { getPipeSizePosPair } from "../utils/random";
import { getRandomCoordiante } from "../utils/random";

const windowHeight = Dimensions.get('window').height
const windowWidth = Dimensions.get('window').width


export default restart => {
    let engine = Matter.Engine.create({ enableSleeping: false })

    let world = engine.world

    world.gravity.y = 0;

    // const pipeSizePosA = getPipeSizePosPair()
    // const pipeSizePosB = getPipeSizePosPair(windowWidth * 0.9)

    const entities = {
        physics: { engine, world },
        NorthBorder: Floor(world, 'brown', { x: windowWidth / 2, y: 0 }, { height: 50, width: windowWidth }),
        EastBorder: Floor(world, 'brown', { x: windowWidth, y: windowHeight / 2 }, { height: windowHeight, width: 50 }),
        SouthBorder: Floor(world, 'brown', { x: windowWidth / 2, y: windowHeight }, { height: 50, width: windowWidth }),
        WestBorder: Floor(world, 'brown', { x: 0, y: windowHeight / 2 }, { height: windowHeight, width: 50 })
    }

    const antSize = { height: 5, width: 5 }
    const colonyPos = { x: windowWidth / 2, y: windowHeight / 2 }
    // for (let index = 1; index <= 15; index++) {
        entities[`Ant${1}`] = Ant(world, 'green', colonyPos, antSize)
    // }

    const spiderSize = { width: 15, height: 15 }
    for (let index = 1; index <= 7; index++) {
        entities[`Spider${index}`] = Enemy(world, 'Spider', 'red', getRandomCoordiante(), spiderSize)
    }

    const obstacleSize = { width: 50, height: 50 }
    for (let index = 1; index <= 10; index++) {
        entities[`Obstacle${index}`] = Obstacle(world, 'Obstacle', 'black', getRandomCoordiante(), obstacleSize)
    }

    const ressourceSize = { width: 8, height: 8 }
    for (let index = 1; index <= 5; index++) {
        entities[`Ressource${index}`] = Ressource(world, 'Ressource', 'yellow', getRandomCoordiante(), ressourceSize)
    }

    return entities
}