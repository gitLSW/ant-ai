
function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function getRandomCoordiante(size) {
    return { x: getRandom(0, size.width), y: getRandom(0, size.height) }
}

const MAX_POINTS = 20
function getPointsForType(type) {
    switch (type) {
        case 'Resource':
            return MAX_POINTS;
        case 'Spider':
            return -10;
        default:
            return 0;
    }
}

module.exports = { 
    getRandom,
    getRandomCoordiante,
    getPointsForType,
    MAX_POINTS
}