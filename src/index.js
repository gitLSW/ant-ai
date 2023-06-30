Error.stackTraceLimit = Infinity;
const { QMainWindow } = require("@nodegui/nodegui")
const Gym = require("./gym")
const { createActorModel, createCriticModel } = require('./ai-model')

// field.children() CAN BE IGNORED, WE CAN SIMULATE IT IN THE BACKGROUND
const floorTileDim = 120
const worldTileNum = 6
const worldSize = { width: floorTileDim * worldTileNum, height: floorTileDim * worldTileNum }

win = new QMainWindow()
win.setFixedSize(worldSize.width, worldSize.height)

async function start() {
    const actor = await createActorModel()
    const critic = await createCriticModel()

    const gym = new Gym(actor, critic, floorTileDim, win)

    win.show()
    global.win = win

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
}

start()



// CLEAN UP UNDISPOSED TENSORS:
// The way to clean any unused tensors in async code is to wrap the code that creates them between a startScope() and an endScope() call.
// tf.engine().startScope()
// tf.engine().endScope()