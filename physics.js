import Matter from "matter-js"

const Physics = (entities, { touches, time, dispatch }) => {
    const engine = entities.physics.engine

    // From this we can calculate the position of each object for the ant
    // console.log(Object.values(entities).map(val => val?.body?.position))

    touches.filter(t => t.type === "move").forEach(t => {
        // console.log(t.event.locationX, t.event.locationY)
        // console.log(t.event.pageX, t.event.pageY)


        entities.Camera.position.x += t.delta.pageX
        entities.Camera.position.y += t.delta.pageY


        Matter.Body.setPosition(entities.Ant1.body, entities.Camera.position)
    })

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


    Matter.Events.on(engine, 'collisionStart', event => {
        const collisionPairs = event.pairs.map(pair => { return { a: pair.bodyA.label, b: pair.bodyB.label } })
        const deaths = [...new Set(collisionPairs.map(pair => {
            if (pair.a.startsWith('ant') && pair.b.startsWith('spider') ||
                pair.a.startsWith('spider') && pair.b.startsWith('ant')) {
                return (a === 'ant') ? a : b
            }

            return null
        })
            .filter(Boolean))] // We need the IDs

        // console.log(deaths)

        // deaths.forEach(death => {
        //     const removeIndex = Object.entries(entities).findIndex(entry => entity.value.label === death))
        //     delete entities[]
        // })

        // TODO: Points

        // dispatch({ type: 'game_over', points: 10 })
    })

    return entities;
}
export default Physics