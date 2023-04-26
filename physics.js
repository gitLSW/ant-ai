import Matter from "matter-js";
// import { getPipeSizePosPair } from "./utils/random";
import { Dimensions } from 'react-native'

const windowHeight = Dimensions.get('window').height
const windowWidth = Dimensions.get('window').width

const Physics = (entities, { touches, time, dispatch }) => {
    let engine = entities.physics.engine

    // console.log(touches)

    // touches.filter(t => t.type === 'press')
    //     .forEach(t => {
    //         console.log(t)

    //         Matter.Body.setVelocity(entities.Bird.body, {
    //             x: 0,
    //             y: -8
    //         })
    //     })

    // From this we can calculate the position of each object for the ant
    // console.log(Object.values(entities).map(val => val?.body?.position))

    touches.filter(t => t.type === "move").forEach(t => {
        // console.log(t)

        // const xDir = ((t.delta.pageX != 0) ? (t.delta.pageX / Math.abs(t.delta.pageX)) : 0)
        // const yDir = ((t.delta.pageY != 0) ? (t.delta.pageY / Math.abs(t.delta.pageY)) : 0)

        // console.log(xDir, yDir)

        // Matter.Body.setVelocity(entities.Bird.body, {
        //     x: xDir,
        //     y: yDir,
        // })

        // console.log(entities.Ant.body)

        Matter.Body.setPosition(entities.Ant1.body, {
            x: entities.Ant1.body.position.x + t.delta.pageX,
            y: entities.Ant1.body.position.y + t.delta.pageY
        })
    });

    Matter.Engine.update(engine, time.delta)

    // for (let index = 1; index <= 2; index++) {
    //     // If a pipe pair was passed, increase the points
    //     if (entities[`ObstacleTop${index}`].body.bounds.max.x <= 50 && !entities[`ObstacleTop${index}`].point) {
    //         entities[`ObstacleTop${index}`].point = true
    //         dispatch({ type: 'new_point' }) // Send event to App.js
    //     }


    //     if (entities[`ObstacleTop${index}`].body.bounds.max.x <= 0) {
    //         const pipeSizePos = getPipeSizePosPair(windowWidth * 0.9);

    //         Matter.Body.setPosition(entities[`ObstacleTop${index}`].body, pipeSizePos.pipeTop.pos)
    //         Matter.Body.setPosition(entities[`ObstacleBottom${index}`].body, pipeSizePos.pipeBottom.pos)

    //         entities[`ObstacleTop${index}`].point = false
    //     }

    //     Matter.Body.translate(entities[`ObstacleTop${index}`].body, { x: -3, y: 0 })
    //     Matter.Body.translate(entities[`ObstacleBottom${index}`].body, { x: -3, y: 0 })
    // }


    Matter.Events.on(engine, 'collisionStart', (event) => {
        // dispatch({ type: 'game_over' })
    })
    
    return entities;
}
export default Physics