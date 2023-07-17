import Matter from "matter-js"

var currentPoints = 0

export default (entities, { time, dispatch }) => {
    const engine = entities.physics.engine
    let world = engine.world

    Matter.Engine.update(engine, time.delta);
    Matter.Events.on(engine, 'collisionStart', event => {
        const collisionPairs = event.pairs.map(pair => { return { a: pair.bodyA.label, b: pair.bodyB.label } })
        collisionPairs.forEach(pair => {
            const hasAnt = pair.a.startsWith('Ant') || pair.b.startsWith('Ant')
            const hasSpider = pair.a.startsWith('Spider') || pair.b.startsWith('Spider')
            const hasRessource = pair.a.startsWith('Ressource') || pair.b.startsWith('Ressource')

            if (hasAnt && hasRessource) {
                dispatch({ type: 'points', points: +20 })
                currentPoints += 20
            }

            if (hasAnt && hasSpider) {
                dispatch({ type: 'points', points: -10 })
                currentPoints -= 10
            }
        })
    })

    console.log(currentPoints)

    if (currentPoints < 20) {
        entities.Hill.level = 1
    }
    else if (currentPoints < 40) {
        entities.Hill.level = 2
    }
    else if (currentPoints < 60) {
        entities.Hill.level = 3
    }
    else if (currentPoints >= 60) {
        entities.Hill.level = 4
    }

    return entities;
}