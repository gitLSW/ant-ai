Error.stackTraceLimit = Infinity;
const { QMainWindow } = require("@nodegui/nodegui")
const Gym = require("./gym")
const Game = require("./game")
const { createActorModel, createCriticModel } = require('./ai-model')

// field.children() CAN BE IGNORED, WE CAN SIMULATE IT IN THE BACKGROUND
const floorTileDim = 120
const worldTileNum = 6
const worldSize = { width: floorTileDim * worldTileNum, height: floorTileDim * worldTileNum }

win = new QMainWindow()
win.setFixedSize(worldSize.width, worldSize.height)

async function start() {
    const trainingMode = false
    const actor = await createActorModel()

    win.show()
    global.win = win

    if (trainingMode) {
        const critic = await createCriticModel()
        const gym = new Gym(actor, critic, floorTileDim, win)

        // Play 20 games
        for (let epoch = 0; epoch < 20; epoch++) {
            await gym.collectSamples()
            await gym.train()

            if (epoch % 5 == 0) {
                const now = new Date().toISOString()
                actor.save('actor_' + now)
                critic.save('critic_' + now)
            }
        }
    } else {
        const game = new Game(actor, floorTileDim, win)
        
        // win.repaint()


        // Play 20 games
        // for (let epoch = 0; epoch < 20; epoch++) {
            game.playRound()
        // }
    }
}

start()



// CLEAN UP UNDISPOSED TENSORS:
// The way to clean any unused tensors in async code is to wrap the code that creates them between a startScope() and an endScope() call.
// tf.engine().startScope()
// tf.engine().endScope()