const { QMainWindow } = require("@nodegui/nodegui")
const Gym = require("./gym")
const { createActorModel } = require('./ai-model')

// field.children() CAN BE IGNORED, WE CAN SIMULATE IT IN THE BACKGROUND
const floorTileDim = 120
const worldTileNum = 6
const worldSize = { width: floorTileDim * worldTileNum, height: floorTileDim * worldTileNum }

win = new QMainWindow()
win.setFixedSize(worldSize.width, worldSize.height)

async function start() {
    const actor = await createActorModel()

    // console.log('INITIAL')
    // aiModel.print();

    const gym = new Gym(actor, floorTileDim, win)

    win.show()
    global.win = win

    // for (let step = 0; step < 20; step++) {
    await gym.collectSamples()
    // }

    // console.log('AFTER')
    // aiModel.print();
}

start()

// Because we do not have a RNN, it is not stateful, meaning the AI will not be affected by previous events
// Therefore we can play the game with multiple ants on the same AI model