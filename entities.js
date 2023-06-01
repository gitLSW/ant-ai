import Matter from "matter-js"
import Ant from "./entities/Ant";
import Rock from "./entities/Rock";
import Leaf from "./entities/Leaf";
import Ressource from './entities/Ressource';
import Spider from './entities/Spider';
import NavTile from './entities/NavTile';
import { getRandom, getRandomCoordiante } from "./utils/random";

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

    
    const navTileSize = { width: 50, height: 50 }
    const obstacleSize = { width: 50, height: 50 }
    const spiderSize = { width: 15, height: 15 }
    const resourceSize = { width: 50, height: 50 }
    let rockIndex = 0
    let spiderIndex = 0
    let resourceIndex = 0
    let leafIndex = 0
    for (let i = 0; i < 20; i++) {
        for (let j = 0; j < 20; j++) {
            let random = getRandom(0, 10)
            if((random ==  1 || random == 2)){
                
                entities[`ImpNavTile${(i * 50) + 25}_${(j * 50) + 25}`] = NavTile(world, {x : (i * 50) + 25, y : (j * 50) + 25}, navTileSize)        
                entities[`Rock${rockIndex}`] = Rock(world, {x : (i * 50) + 25, y : (j * 50) + 25}, obstacleSize)
                rockIndex++
                
            }
            else if(random == 3){
                
                entities[`NavTile${(i * 50) + 25}_${(j * 50) + 25}`] = NavTile(world, {x : (i * 50) + 25, y : (j * 50) + 25}, navTileSize)        
                entities[`Spider${spiderIndex}`] = Spider(world, {x : (i * 50) + 25, y : (j * 50) + 25}, spiderSize)
                spiderIndex++
                
            }
            else if(random == 4){
                
                entities[`NavTile${(i * 50) + 25}_${(j * 50) + 25}`] = NavTile(world, {x : (i * 50) + 25, y : (j * 50) + 25}, navTileSize)        
                entities[`Leaf${leafIndex}`] = Leaf(world, {x : (i * 50) + 25, y : (j * 50) + 25}, obstacleSize)
                leafIndex++
                
            }
            else if(random == 5){
                
                entities[`NavTile${(i * 50) + 25}_${(j * 50) + 25}`] = NavTile(world, {x : (i * 50) + 25, y : (j * 50) + 25}, navTileSize)        
                entities[`Ressource${resourceIndex}`] = Ressource(world, 'Ressource', {x : (i * 50) + 25, y : (j * 50) + 25}, resourceSize)
                resourceIndex++
                
            }
            else{
                entities[`NavTile${(i * 50) + 25}_${(j * 50) + 25}`] = NavTile(world, {x : (i * 50) + 25, y : (j * 50) + 25}, navTileSize)
            }
            
        }
    }
    const antSize = { height: 8, width: 8 }
    const colonyPos = { x: levelWidth / 2, y: levelHeight / 2 }
    // for (let index = 1; index <= 15; index++) {
        entities[`Ant${1}`] = Ant(world, colonyPos, antSize)
    // }  

    return {
        ...entities,
        Camera: { position: { x: 0, y: 0 } }
    }
}