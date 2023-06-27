
function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function getRandomCoordiante(size) {
    return { x: getRandom(0, size.width), y: getRandom(0, size.height) }
}

const NUMBER_ENTITIES_IN_FOV = 5
const ACTOR_INPUT_LAYER_SIZE = NUMBER_ENTITIES_IN_FOV * 3 // MUST BE A MULTIPLE OF 5: Because the Input Layer consists of the closest 5 Objects to the Ant where each Objects uses 2 Neurons for Pos Relative to Ant (=> dx, dy) and 1 for which type the object is
const ACTOR_OUTPUT_LAYER_SIZE = 2 // 2 because the Network spits out a vector with dx and dy wheer it wants to go and how fast in each direction (-1 < dx, dy < 1)
const CRITIC_INPUT_LAYER_SIZE = ACTOR_INPUT_LAYER_SIZE + ACTOR_OUTPUT_LAYER_SIZE

module.exports = { 
    getRandom,
    getRandomCoordiante,
    NUMBER_ENTITIES_IN_FOV,
    ACTOR_INPUT_LAYER_SIZE,
    ACTOR_OUTPUT_LAYER_SIZE,
    CRITIC_INPUT_LAYER_SIZE
}