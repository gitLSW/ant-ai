import Matter from "matter-js"
import aiUpdate from "./ai-control"

var currentPoints = 0
var cleanedUp = false
var completedCollIDs = []

export default (entities, { time, dispatch, events }) => {
    // Testing
    if (events?.length) {
        events
            .filter(event => event.type === 'keypress')
            .forEach(event => {
                const speed = 2
                const ant = entities['Ant_0'].body
                switch (event.key) {
                    case 'w':
                        Matter.Body.setVelocity(ant, { x: 0, y: -speed })
                        break
                    case 'a':
                        Matter.Body.setVelocity(ant, { x: -speed, y: 0 })
                        break
                    case 's':
                        Matter.Body.setVelocity(ant, { x: 0, y: speed })
                        break
                    case 'd':
                        Matter.Body.setVelocity(ant, { x: speed, y: 0 })
                        break
                    default:
                        break
                }
            })
    }

    const engine = entities.physics.engine
    let world = engine.world

    Matter.Engine.update(engine, time.delta);

    if (!cleanedUp) {
        Matter.Events.on(engine, 'collisionActive', event => {
            event.pairs.forEach(pair => {
                const aID = pair.bodyA.label
                const bID = pair.bodyB.label
                const aType = aID.split('_')[0]
                const bType = bID.split('_')[0]

                const hasAnt = aType === 'Ant' || bType === 'Ant'

                if (!hasAnt) {
                    if (aType === 'Hill') {
                        delete entities[bID]
                        Matter.World.remove(world, pair.bodyB)
                    } else if (bType === 'Hill') {
                        delete entities[aID]
                        Matter.World.remove(world, pair.bodyA)
                    }
                }
            })

            cleanedUp = true
            Matter.Events.off('collisionActive')
        })
    }

    Matter.Events.on(engine, 'collisionStart', event => {
        var antVision = {} // { antID: [CollisonData]} => CollisonData = { type, dx, dy }

        event.pairs.forEach(pair => {
            if (completedCollIDs.includes(pair.id)) {
                return
            }

            const aID = pair.bodyA.label
            const bID = pair.bodyB.label
            const aType = aID.split('_')[0]
            const bType = bID.split('_')[0]

            const hasAntSensor = aType === 'AntSensor' || bType === 'AntSensor'
            const hasAnt = aType === 'AntBody' || bType === 'AntBody'
            const hasSpider = aType === 'Spider' || bType === 'Spider'
            const hasRessource = aType === 'Ressource' || bType === 'Ressource'

            if (hasAntSensor) {
                var antIndex = aID.split('_')[1]
                var antPos = pair.bodyA.position
                var otherPos = pair.bodyB.position
                var otherType = bType

                if (bType === 'AntSensor') {
                    antIndex = bID.split('_')[1]
                    antPos = pair.bodyB.position
                    otherPos = pair.bodyA.position
                    otherType = aType
                }

                const collData = { type: otherType, dx: otherPos.x - antPos.x, dy: otherPos.y - antPos.y }
                antVision[`Ant_${antIndex}`] = [...(antVision[`Ant_${antIndex}`] ?? []), collData]
            }

            if (hasAnt && hasRessource) {
                if (aType === 'Ressource') {
                    delete entities[aID]
                    Matter.World.remove(world, pair.bodyA)
                } else if (bType === 'Ressource') {
                    delete entities[bID]
                    Matter.World.remove(world, pair.bodyB)
                }

                currentPoints += 20
                dispatch({ type: 'points', points: currentPoints })
            }

            if (hasAnt && hasSpider) {
                if (aType === 'Spider') {
                    delete entities[aID]
                    Matter.World.remove(world, pair.bodyA)
                } else if (bType === 'Spider') {
                    delete entities[bID]
                    Matter.World.remove(world, pair.bodyB)
                }

                currentPoints -= 10
                dispatch({ type: 'points', points: currentPoints })
            }

            completedCollIDs.push(pair.id)
        })

        Object.entries(antVision).forEach(async entry => aiUpdate(entities[entry[0]], entry[1]))
    })

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