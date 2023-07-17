const Matter = require("matter-js");
const { getRandom, getRandomCoordiante, getMovementSpeed, INPUT_LAYER_SIZE, NUMBER_ENTITIES_IN_FOV } = require('./utils')
const tf = require('@tensorflow/tfjs-node')
const path = require('path')

function getEntities(worldSize, trainingActorID) {
    var entities = {}

    // const resourceSize = { width: 45, height: 45 }
    // const obstacleSize = { width: 50, height: 50 }
    // const spiderSize = { width: 35, height: 35 }
    // const antSize = { width: 25, height: 25 }

    if (trainingActorID) {
        const randCoordinate = getRandomCoordiante(worldSize)
        entities[trainingActorID] = Matter.Bodies.circle(
            randCoordinate.x,
            randCoordinate.y,
            12.5 // Radius
        )
    }

    var hasResource = false
    for (let i = 0; i < 100; i++) {
        const randCoordinate = getRandomCoordiante(worldSize)

        let random = getRandom(0, 7)
        if (!hasResource || random == 0) {
            hasResource = true
            const id = `Resource_${i}`
            entities[id] = Matter.Bodies.circle(
                randCoordinate.x,
                randCoordinate.y,
                22.5 // Radius
            )
        } else if (1 <= random && random <= 3) {
            const id = `Obstacle_${i}`
            entities[id] = Matter.Bodies.circle(
                randCoordinate.x,
                randCoordinate.y,
                25 // Radius
            )
        }
        else if (random == 4) {
            const id = `Spider_${i}`
            entities[id] = Matter.Bodies.circle(
                randCoordinate.x,
                randCoordinate.y,
                17.5 // Radius
            )
        }
        else if (!trainingActorID && random == 5) {
            const id = `Ant_${i}`
            entities[id] = Matter.Bodies.circle(
                randCoordinate.x,
                randCoordinate.y,
                12.5 // Radius
            )
        }
    }

    return entities
}


function getTypeInput(entityType, actorID) {
    // Because ants and Spiders run on the same NN, we have to differentiate between friendlies and enimies
    const actorType = actorID.split('_')[0]

    switch (entityType) {
        case 'Obstacle':
            return 1;
        case 'Ant':
            return actorType === entityType ? 2 : 3; // 2=friendly
        case 'Spider':
            return actorType === entityType ? 2 : 3; // 3=enemy
        case 'Resource':
            return 4;
        default:
            return 0;
    }
}

class Field {
    // if the calls to Gt still fail, we can make our own copies of all the states
    // trainingMode: only one Ant on field
    constructor(worldSize, engine, timeDelta) {
        this.worldSize = worldSize
        this.engine = engine
        this.timeDelta = timeDelta
    }

    getPos(entityID) {
        return this.entities[entityID].position
    }

    move(id, dirV) {
        const entity = this.entities[id]
        if (!entity) {
            console.log(`Couldn't find ${id}`)
            return
        }

        const type = id.split('_')[0]
        const movementSpeed = getMovementSpeed(type)
        Matter.Body.setVelocity(entity, { x: dirV.dx * movementSpeed, y: dirV.dy * movementSpeed })

        console.log(dirV, entity.position)

        return entity.position
    }

    reset(trainingActorID) {
        Matter.Composite.clear(this.engine.world, false, true)
        this.entities = getEntities(this.worldSize, trainingActorID)
        Matter.Composite.add(this.engine.world, Object.values(this.entities))
    }

    getFOV(actorID) {
        const actor = this.entities[actorID]
        const actorPos = actor.position
        return Object.entries(this.entities)
            .flatMap(([entityID, entity]) => {
                if (entityID === actorID) {
                    return null
                }

                const type = entityID.split('_')[0]
                const entityPos = entity.position
                const dir = { dx: entityPos.x - actorPos.x, dy: entityPos.y - actorPos.y }
                const distance = Math.sqrt(Math.pow(dir.dx, 2) + Math.pow(dir.dy, 2))
                return { id: entityID, type, dir, distance }
            })
            .filter(Boolean)
            .sort((a, b) => a.distance - b.distance)
    }

    // USE MATTER.js
    collisionsWith(actorID) {
        var collisions = []

        Matter.Engine.update(this.engine, this.timeDelta);
        Matter.Events.on(this.engine, 'collisionStart', event => {
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

        return collisions

        // const actor = this.entities[actorID]
        // const actorGeom = actor?.geometry()

        // return Object.entities(this.entities)
        //     .filter(([entityID, entity]) => actorID !== entityID && this.isIntersecting(actorGeom, entity.geometry()))
        //     .map(([entityID, entity]) => {
        //         const type = entityID.split('_')[0]
        //         return { id: entityID, type }
        //     })
    }

    // Matter.js shit maybe ??!
    delete(id) {
        const entity = this.entities[id]
        Matter.Composite.remove(this.engine.world, entity);
        delete this.entities[id]
    }

    getInputTensor(fov, actorID) {
        const inputValues = fov
            .slice(0, NUMBER_ENTITIES_IN_FOV) // Always the 5 closest Collsions
            .flatMap(entity => {
                return [
                    entity.dir.dx, // xDir
                    entity.dir.dy, // yDir
                    getTypeInput(entity.type, actorID)
                ]
            })

        // Preprocess the input data
        return tf.tensor(inputValues).reshape([-1, INPUT_LAYER_SIZE]) // reshape is needed for some reason
    }

    hasResources() {
        return new Boolean(Object.keys(this.entities).find(entityID => entityID.startsWith('Resource')))
    }
}

module.exports = Field