const path = require('path')
const MODEL_PATH = path.resolve(__dirname + '/../ai-models/').toString()

function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function getRandomCoordiante(size) {
    return { x: getRandom(0, size.width), y: getRandom(0, size.height) }
}

// x can be anything but it is ideal between 0 and 1
function getUnitVector(outputScalar) {
    const angle = 2 * Math.PI * outputScalar; // Convert outputScalar to an angle (in radians)
    return { dx: Math.cos(angle), dy: Math.sin(angle) }; // Return the dx, dy coordinates
}

function getStats(array) {
    if (!Array.isArray(array)) {
        return new Error('Input must be a array.');
    }

    const sum = array.reduce((acc, val) => acc + val, 0);
    const mean = sum / array.length;

    const sd = Math.sqrt(array.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (array.length - 1));

    return { sd, mean };
}

const NUMBER_ENTITIES_IN_FOV = 5
const INPUT_LAYER_SIZE = NUMBER_ENTITIES_IN_FOV * 3 // MUST BE A MULTIPLE OF 5: Because the Input Layer consists of the closest 5 Objects to the Ant where each Objects uses 2 Neurons for Pos Relative to Ant (=> dx, dy) and 1 for which type the object is
const OUTPUT_LAYER_SIZE = 1 // 1 because the Network spits out a scalar between 0 and 1 that gets converted to a unit vector

function getMovementSpeed(type) {
    switch (type) {
        case 'Ant':
            return 3
        case 'Spider':
            return 1
        default:
            return 0
    }
}

// function getHealth(type)
// function getDamage(type)

function getPoints(entityType, actorID) {
    const actorType = actorID.split('_')[0]

    switch (entityType) {
        case 'Resource':
            return 20;
        case 'Ant':
            return actorType === entityType ? 0 : -10;
        case 'Spider':
            return actorType === entityType ? 0 : -10;
        default:
            return 0;
    }
}

module.exports = {
    MODEL_PATH,
    NUMBER_ENTITIES_IN_FOV,
    INPUT_LAYER_SIZE,
    OUTPUT_LAYER_SIZE,
    getRandom,
    getRandomCoordiante,
    getUnitVector,
    getMovementSpeed,
    getPoints,
    getStats
}