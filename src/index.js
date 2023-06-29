// const tf=require("@tensorflow/tfjs")
// const f = (a, b) => tf.pow(a, b).mul(b);
  
// // Grad function is used
// const g = tf.grads(f);
  
// // Tensor is declared
// const a = tf.tensor1d([5, 6, 3]);
// const b = tf.tensor1d([2, 4, 1]);
  
// // Variables are defined
// const [d1, d2] = g([a, b]);
  
// // Variable is printed
// d1.print();
// d2.print();

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

    // console.log('INITIAL')
    // aiModel.print();

    const gym = new Gym(actor, critic, floorTileDim, win)

    win.show()
    global.win = win

    // for (let step = 0; step < 20; step++) {
    await gym.collectSamples()
    // }

    await gym.trainCritic()
    // console.log('AFTER')
    // aiModel.print();

    await gym.trainActor()
}

start()

// Because we do not have a RNN, it is not stateful, meaning the AI will not be affected by previous events
// Therefore we can play the game with multiple ants on the same AI model