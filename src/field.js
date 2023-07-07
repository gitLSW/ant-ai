const { QLabel, QPixmap, QWidget } = require("@nodegui/nodegui")
const { getRandom, getRandomCoordiante, getMovementSpeed, INPUT_LAYER_SIZE, NUMBER_ENTITIES_IN_FOV } = require('./utils')
const tf = require('@tensorflow/tfjs-node')
const path = require('path')

var imageCache = {}

function getImage(imageName, size) {
    if (imageCache[imageName]) {
        return imageCache[imageName]
    }

    var image = new QPixmap()
    const absPath = path.resolve(`${__dirname}/../assets/${imageName}.png`).toString()
    image.load(absPath)
    image = image.scaled(size.width, size.height, 1)

    imageCache[imageName] = image

    return image
}

function setupBackground(parent, floorTileDim, worldSize) {
    const xTileNum = (worldSize.width / floorTileDim) + 1
    const yTileNum = (worldSize.height / floorTileDim) + 1

    for (let i = 0; i < xTileNum; i++) {
        for (let j = 0; j < yTileNum; j++) {
            const label = new QLabel(parent)
            label.setObjectName(`floor_${i}_${j}`)
            label.setGeometry(i * floorTileDim, j * floorTileDim, floorTileDim, floorTileDim)
            label.setPixmap(getImage('floor', { width: floorTileDim, height: floorTileDim }))
            label.show()
        }
    }

    parent.show()
}

function getObstacleImage() {
    switch (getRandom(0, 2)) {
        case 0:
            return 'stone'
        case 1:
            return 'leaf'
        case 2:
            return 'twig'
    }
}

function createGameObj(imageName, objName, pos, size, parent) {
    const label = new QLabel(parent)
    label.setObjectName(objName)
    label.setGeometry(pos.x, pos.y, size.width, size.height)

    label.setPixmap(getImage(imageName, size))

    // label.setInlineStyle(`width:${size.width}px; height:${size.height}px`)
    label.show()

    return label
}

// Takes in the output of the NN and returns the sum of all the directional vectors * activation for that direction
// Convert the direction to radians: There are OUTPUT_LAYER_SIZE directions to walk
// const radians = tf.mul(tf.range(0, OUTPUT_LAYER_SIZE), tf.scalar(2 * Math.PI / OUTPUT_LAYER_SIZE));
// // Calculate the x and y components of the unit vector and create a matrix: x = cos(radians), y = sin(radians)
// const unitVectorMatrix = tf.stack([tf.cos(radians), tf.sin(radians)], 1)
// function getMovement(movementDecision) {
//     // Multiply the unit vector matrix of each direction with the activation of the directon

//     /// CHECK OUT THIS .sum IT MAY SUM UP THE x + y and create a 1dVector uf useless shit.
//     // It needs to create a Vector with two components: ( sumX, sumY )
//     return tf.sum(tf.mul(tf.tensor1d(movementDecision), unitVectorMatrix))
// }

function populateField(parent, worldSize, trainingActorID) {
    var entities = {}

    const ressourceSize = { width: 45, height: 45 }
    const obstacleSize = { width: 50, height: 50 }
    const spiderSize = { width: 35, height: 35 }
    const antSize = { width: 25, height: 25 }

    if (trainingActorID) {
        entities[trainingActorID] = createGameObj('ant', trainingActorID, getRandomCoordiante(worldSize), antSize, parent)
    }

    var hasRessource = false
    for (let i = 0; i < 50; i++) {
        const randCoordinate = getRandomCoordiante(worldSize)

        let random = getRandom(0, 7)
        if (!hasRessource || random == 0) {
            hasRessource = true
            const id = `Ressource_${i}`
            entities[id] = createGameObj('berries', id, randCoordinate, ressourceSize, parent)
        } else if (1 <= random && random <= 3) {
            const id = `Obstacle_${i}`
            entities[id] = createGameObj(getObstacleImage(), id, randCoordinate, obstacleSize, parent)
        }
        else if (random == 4) {
            const id = `Spider_${i}`
            entities[id] = createGameObj('spider', id, randCoordinate, spiderSize, parent)
        }
        else if (!trainingActorID && random == 5) {
            const id = `Ant_${i}`
            entities[id] = createGameObj('ant', id, randCoordinate, antSize, parent)
        }
    }

    return entities
}

// function clearField(parent) {
//     parent.children().forEach(child => {
//         const id = child?.objectName()
//         if (!id.startsWith('floor')) {
//             child.delete()
//         }
//     })
// }

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
    constructor(win, floorTileDim) {
        const winSize = win.geometry()
        this.worldSize = { width: winSize.width(), height: winSize.height() }

        const background = new QWidget(win)
        background.setGeometry(0, 0, this.worldSize.width, this.worldSize.height)

        setupBackground(background, floorTileDim, this.worldSize)

        this.field = new QWidget(win)
        this.field.show()
    }

    getPos(entityID) {
        return this.entities[entityID].pos()
    }

    move(id, dirV) {
        const entity = this.entities[id]
        if (!entity) {
            console.log(`Couldn't find ${id}`)
            return
        }

        const entityPos = entity?.pos()

        const type = id.split('_')[0]
        const movementSpeed = getMovementSpeed(type)
        entity?.move(entityPos.x + dirV.dx * movementSpeed, entityPos.y + dirV.dy * movementSpeed)

        return entity?.pos()
    }

    reset(trainingActorID) {
        const parent = this.field.parent()
        this.field.delete()
        this.field = new QWidget(parent)
        this.field.setGeometry(0, 0, this.worldSize.width, this.worldSize.height)
        this.entities = populateField(this.field, this.worldSize, trainingActorID)
        this.field.show()
    }

    // updateEntities() {
    //     this.field.children().forEach(child => {
    //         const id = child.objectName();
    //         this.entities[id] = child
    //     })
    // }

    getFOV(actorID) {
        const actor = this.entities[actorID]
        const actorPos = actor.pos()
        return Object.entries(this.entities)
            .flatMap(pair => {
                const entityID = pair[0]
                if (entityID === actorID) {
                    return null
                }

                const type = entityID.split('_')[0]
                const entityPos = pair[1].pos()
                const dir = { dx: entityPos.x - actorPos.x, dy: entityPos.y - actorPos.y }
                const distance = Math.sqrt(Math.pow(dir.dx, 2) + Math.pow(dir.dy, 2))
                return { id: entityID, type, dir, distance }
            })
            .filter(Boolean)
            .sort((a, b) => a.distance - b.distance)
    }

    collisionsWith(actorID) {
        const actor = this.entities[actorID]
        const actorGeom = actor?.geometry()

        return Object.values(this.entities)
            .filter(entity => actorID !== entity.objectName() && this.isIntersecting(actorGeom, entity.geometry()))
            .map(entity => {
                const entityID = entity.objectName()
                const type = entityID.split('_')[0]
                return { id: entityID, type }
            })
    }

    delete(id) {
        this.entities[id].delete()
        delete this.entities[id]
    }

    isIntersecting(aGeom, bGeom) {
        // Check if rectA and rectB intersect
        return aGeom.left() + aGeom.width() > bGeom.left() &&
            bGeom.left() + bGeom.width() > aGeom.left() &&
            aGeom.top() + aGeom.height() > bGeom.top() &&
            bGeom.top() + bGeom.height() > aGeom.top()
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
        return tf.tidy(() => tf.tensor(inputValues).reshape([-1, INPUT_LAYER_SIZE])) // reshape is needed for some reason
    }

    hasRessources() {
        return new Boolean(Object.values(this.entities).find(e => e.objectName().startsWith('Ressource')))
    }
}

module.exports = Field