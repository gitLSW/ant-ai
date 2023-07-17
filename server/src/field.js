const Matter = require("matter-js");
const { getRandom, getRandomCoordiante, getMovementSpeed, INPUT_LAYER_SIZE, NUMBER_ENTITIES_IN_FOV } = require('./utils')
const tf = require('@tensorflow/tfjs-node')
const path = require('path')

function getEntities(worldSize, trainingActorID) {
    const ANT_COLL_GROUP = 0b0001
    const OBJECT_COLL_GROUP = 0b0010
    const ENEMY_COLL_GROUP = 0b0100

    const borderWidth = 100

    // Matter.Bodies.rectangle sets the center !!
    const borderCollFilter = {
        group: 0,
        mask: 1,
        category: 2,
    }
    var entities = {
        Border_North: Matter.Bodies.rectangle(worldSize.width / 2, -borderWidth / 2, worldSize.width, borderWidth, { isStatic: true, label: 'Border_North', collisionFilter: borderCollFilter }),
        Border_East: Matter.Bodies.rectangle(worldSize.width + borderWidth / 2, worldSize.height / 2, borderWidth, worldSize.height, { isStatic: true, label: 'Border_East', collisionFilter: borderCollFilter }),
        Border_South: Matter.Bodies.rectangle(worldSize.width / 2, worldSize.height + borderWidth / 2, worldSize.width, borderWidth, { isStatic: true, label: 'Border_South', collisionFilter: borderCollFilter }),
        Border_West: Matter.Bodies.rectangle(-borderWidth / 2, worldSize.height / 2, borderWidth, worldSize.height, { isStatic: true, label: 'Border_West', collisionFilter: borderCollFilter })
    }

    // const resourceSize = { width: 45, height: 45 }
    // const obstacleSize = { width: 50, height: 50 }
    // const spiderSize = { width: 35, height: 35 }
    // const antSize = { width: 25, height: 25 }

    if (trainingActorID) {
        const randCoordinate = getRandomCoordiante(worldSize)
        entities[trainingActorID] = Matter.Bodies.circle(
            randCoordinate.x,
            randCoordinate.y,
            12.5, // Radius
            {
                label: trainingActorID,
                collisionFilter: {
                    group: 0,
                    mask: OBJECT_COLL_GROUP | ENEMY_COLL_GROUP,
                    category: ANT_COLL_GROUP,
                }
            }
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
                22.5, // Radius
                {
                    label: id,
                    collisionFilter: {
                        group: 0,
                        mask: ANT_COLL_GROUP,
                        category: OBJECT_COLL_GROUP,
                    }
                }
            )
        } else if (1 <= random && random <= 3) {
            const id = `Obstacle_${i}`
            entities[id] = Matter.Bodies.circle(
                randCoordinate.x,
                randCoordinate.y,
                25, // Radius
                {
                    isStatic: true,
                    label: id,
                    collisionFilter: {
                        group: 0,
                        mask: ANT_COLL_GROUP | ENEMY_COLL_GROUP,
                        category: OBJECT_COLL_GROUP,
                    }
                }
            )
        }
        else if (random == 4) {
            const id = `Spider_${i}`
            entities[id] = Matter.Bodies.circle(
                randCoordinate.x,
                randCoordinate.y,
                17.5, // Radius
                {
                    label: id,
                    collisionFilter: {
                        group: 0,
                        mask: ANT_COLL_GROUP | OBJECT_COLL_GROUP,
                        category: ENEMY_COLL_GROUP,
                    }
                }
            )
        }
        else if (!trainingActorID && random == 5) {
            const id = `Ant_${i}`
            entities[id] = Matter.Bodies.circle(
                randCoordinate.x,
                randCoordinate.y,
                12.5, // Radius
                {
                    label: id,
                    collisionFilter: {
                        group: 0,
                        mask: OBJECT_COLL_GROUP | ENEMY_COLL_GROUP,
                        category: ANT_COLL_GROUP,
                    }
                }
            )
        }
    }

    return entities
}


function getTypeInput(entityType, actorID) {
    // Because ants and Spiders run on the same NN, we have to differentiate between friendlies and enimies
    const actorType = actorID.split('_')[0]

    switch (entityType) {
        case 'Obstacle', 'Border':
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
    constructor(worldSize, engine) {
        this.worldSize = worldSize
        this.engine = engine
    }

    getPos(entityID) {
        return this.entities[entityID].position
    }

    move(id, dirV, speed) {
        const entity = this.entities[id]
        if (!entity) {
            console.log(`Couldn't find ${id}`)
            return
        }

        const type = id.split('_')[0]
        const movementSpeed = getMovementSpeed(type)

        Matter.Body.setVelocity(entity, { x: dirV.dx * speed * movementSpeed, y: dirV.dy * speed * movementSpeed })

        if (entity.position.x < 0 || this.worldSize.width < entity.position.x ||
            entity.position.y < 0 || this.worldSize.height < entity.position.y) {
            console.log(entity.position)
        }

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

    collisionsWith(actorID) {
        Matter.Engine.update(this.engine, 1)
        const actor = this.entities[actorID]
        
        return Object.entries(this.entities).map(([entityID, entity]) => {
            if (entityID === actorID) {
                return null
            }

            const collision = Matter.Collision.collides(actor, entity)
            if (collision) {
                return { id: entityID, type: entityID.split('_')[0] }
            }

            return null
        })
        .filter(Boolean)

        // Matter.Events.on(this.engine, 'collisionStart', event => {
        //     console.log('2')
        //     const collisions = event.pairs
        //         .map(pair => { return { a: pair.bodyA.label, b: pair.bodyB.label } })
        //         .map(pair => {
        //             const aType = pair.a.split('_')[0]
        //             const bType = pair.b.split('_')[0]

        //             if (pair.a !== actorID && pair.b !== actorID) {
        //                 return null
        //             }

        //             return {
        //                 id: aType == 'Ant' ? pair.b : pair.a,
        //                 type: aType == 'Ant' ? bType : aType
        //             }
        //         })
        //         .filter(Boolean)
        // })
    }

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