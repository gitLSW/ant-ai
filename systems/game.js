import Matter from "matter-js"

export default Game = (entities, { time, dispatch }) => {
    const engine = entities.physics.engine

    Matter.Engine.update(engine, time.delta)

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