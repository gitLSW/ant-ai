const tf = require('@tensorflow/tfjs-node')

// Calling the .customGrad() function
// with the custom function "f" as
// it's parameter
const customOp = tf.customGrad(
    // Initializing a custom function f
    (a, save) => {
        console.log('a:')
        a.print()
        // Saving a for its availability later for the gradient
        save([a]);

        // Overriding gradient of a^3
        return {
            value: a.pow(tf.scalar(3, 'int32')),

            // Here "saved.a" pointing to "a" which
            // have been saved above
            gradFunc: (dy, saved) => {
                console.log('dy:')
                dy.print()

                console.log('saved:')
                saved[0].print()
                return [tf.pow(saved[0], 2).mul(3)]
            }
        };
    }
);

// function customOp(a) {
//     return a.pow(tf.scalar(3, 'int32'))
// }

// Initializing a 1D Tensor of some values
const a = tf.tensor1d([0, -1, 2, -2, 0.3]);

// Printing the custom function "f" for the
// above specified Tensor "a"
// console.log(`f(a):`);
// customOp(a).print();

// customOp(a).print()


// Getting the gradient of above function
// f for the above specified Tensor values
console.log(`f'(a):`);
tf.grad(a => customOp(a))(a).print();



// const { QMainWindow } = require("@nodegui/nodegui")
// const Gym = require("./gym")
// const { createActorModel, createCriticModel } = require('./ai-model')

// // field.children() CAN BE IGNORED, WE CAN SIMULATE IT IN THE BACKGROUND
// const floorTileDim = 120
// const worldTileNum = 6
// const worldSize = { width: floorTileDim * worldTileNum, height: floorTileDim * worldTileNum }

// win = new QMainWindow()
// win.setFixedSize(worldSize.width, worldSize.height)

// async function start() {
//     const actor = await createActorModel()
//     const critic = await createCriticModel()

//     // console.log('INITIAL')
//     // aiModel.print();

//     const gym = new Gym(actor, critic, floorTileDim, win)

//     win.show()
//     global.win = win

//     // for (let step = 0; step < 20; step++) {
//     await gym.collectSamples()
//     // }

//     // console.log('AFTER')
//     // aiModel.print();
// }

// start()

// // Because we do not have a RNN, it is not stateful, meaning the AI will not be affected by previous events
// // Therefore we can play the game with multiple ants on the same AI model