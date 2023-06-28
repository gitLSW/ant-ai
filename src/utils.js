
function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function getRandomCoordiante(size) {
    return { x: getRandom(0, size.width), y: getRandom(0, size.height) }
}

const NUMBER_ENTITIES_IN_FOV = 5
const INPUT_LAYER_SIZE = NUMBER_ENTITIES_IN_FOV * 3 // MUST BE A MULTIPLE OF 5: Because the Input Layer consists of the closest 5 Objects to the Ant where each Objects uses 2 Neurons for Pos Relative to Ant (=> dx, dy) and 1 for which type the object is
const OUTPUT_LAYER_SIZE = 2 // 2 because the Network spits out a vector with dx and dy where it wants to go and how fast in each direction (-1 < dx, dy < 1)

function getMovementSpeed(type) {
    switch (type) {
        case 'type':
            return 10
        case 'Spider':
            return 7
        default:
            return 0
    }
}

// function getHealth(type)
// function getDamage(type)

function getPoints(entityType, actorID) {
    const actorType = actorID.split('_')[0]

    switch (entityType) {
        case 'Ant':
            return actorType === entityType ? 0 : -10;
        case 'Spider':
            return actorType === entityType ? 0 : -10;
        case 'Resource':
            return 20;
        default:
            return 0;
    }
}

module.exports = { 
    getRandom,
    getRandomCoordiante,
    getMovementSpeed,
    getPoints,
    NUMBER_ENTITIES_IN_FOV,
    INPUT_LAYER_SIZE,
    OUTPUT_LAYER_SIZE
}