const { QMainWindow } = require("@nodegui/nodegui")
const Gym = require("./gym")
const { createModel } = require('./ai-model')

// field.children() CAN BE IGNORED, WE CAN SIMULATE IT IN THE BACKGROUND
const floorTileDim = 120
const worldTileNum = 6
const worldSize = { width: floorTileDim * worldTileNum, height: floorTileDim * worldTileNum }

win = new QMainWindow()
win.setFixedSize(worldSize.width, worldSize.height)

async function start() {
    const aiModel = await createModel()
    const gym = new Gym(aiModel, floorTileDim, win)

    // while (true) {
    gym.runTrainingEpisode()
    // }
}

start()
win.show()
global.win = win


// Because we do not have a RNN, it is not stateful, meaning the AI will not be affected by previous events
// Therefore we can play the game with multiple ants on the same AI model