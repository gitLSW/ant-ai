const tf = require('@tensorflow/tfjs')
require('@tensorflow/tfjs-node');
const { getPointsForType, MAX_POINTS } = require('./score')

const model = tf.sequential({
    layers: [
        // Input Layer
        tf.layers.inputLayer({ inputShape: [15], activation: 'linear' }),

        // Hidden Layers
        tf.layers.dense({ units: 20, activation: 'relu' }),
        tf.layers.dense({ units: 20, activation: 'relu' }),
        tf.layers.dense({ units: 10, activation: 'relu6' }),

        // Output Layer is a vector with dx and dy between -1 and 1,
        // denoting how fast in which direction relative to max speed the AI wants to walk
        tf.layers.dense({ units: 2, activation: 'tanh' })
    ]
});

function reactTo(fovEntities, worldSize) {
    // Load the model
    // const model = await tf.loadLayersModel('file://path/to/your/model.json')

    const inputValues = fovEntities
        .slice(0, 5) // Always the 5 closest Collsions
        .flatMap(entity => {
            return [
                // Normalize direction Vectors: vector / worldSize
                entity.dirV.dx / worldSize.width, // xDir
                entity.dirV.dy / worldSize.height, // yDir
                getPointsForType(entity.type) / MAX_POINTS // points
            ]
        })

    // Preprocess the input data
    const input = tf.tensor(inputValues).reshape([-1, 15]); // reshape is needed for some reason

    // console.log(input)

    // Make predictions
    model.predict(input).print();
    // const output = predictions.dataSync();

    // // Cleanup
    // input.dispose();
    // predictions.dispose();
    // // model.dispose();

    // // Return the output as an array
    // const out = Array.from(output);
    // return { dx: out[0], dy: out[1] }
}

module.exports = { reactTo }