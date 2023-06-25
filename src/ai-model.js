const tf = require('@tensorflow/tfjs-node')
// const path = require('path')

// const modelPath = path.resolve(__dirname + '/../ai-models').toString()

class AIModel {
    constructor(network) {
        this.network = network
        this.network.summary();
        this.network.compile({ optimizer: 'adam', loss: 'meanSquaredError' });
    }

    reactTo(input) {
        // console.log(input)

        // Make predictions
        const prediction = tf.tidy(() => this.network.predict(input))
        
        const out = prediction.dataSync();
        input.dispose();

        // // Cleanup
        // input.dispose();
        // predictions.dispose();
        // // model.dispose();

        // // Return the output as an array
        // const out = Array.from(output);
        return { dx: out[0], dy: out[1] }
    }

    /**
     * @param {tf.Tensor[]} xBatch
     * @param {tf.Tensor[]} yBatch
     */
    async train(xBatch, yBatch) {
        await this.network.fit(xBatch, yBatch);
    }

    /**
     * @param {tf.Tensor} input
     * @returns {number} The action chosen by the model: Directional Vector with dx and dy between -1 - 1
     */
    chooseAction(input, explorationRate = 0) {
        return (Math.random() < explorationRate) ?
            { dx: Math.random() * 2 - 1, dy: Math.random() * 2 - 1 } :
            this.reactTo(input)
    }
}


async function createModel(path) {
    if (!path) {
        const network = tf.sequential({
            layers: [
                // Input Layer
                tf.layers.inputLayer({ inputShape: [15], activation: 'linear' }),

                // Hidden Layers
                tf.layers.dense({ units: 20, activation: 'relu' }),
                tf.layers.dense({ units: 20, activation: 'relu6' }),
                tf.layers.dense({ units: 15, activation: 'sigmoid' }),
                tf.layers.dense({ units: 10, activation: 'relu' }),

                // Output Layer is a vector with dx and dy between -1 and 1,
                // denoting how fast in which direction relative to max speed the AI wants to walk
                tf.layers.dense({ units: 2, activation: 'tanh' })
            ]
        });

        return new AIModel(network)
    }

    const modelsInfo = await tf.io.listModels();
    if (path in modelsInfo) {
        console.log(`Loading AI model from ${modelPath}...`)
        return new AIModel(await tf.loadLayersModel(path))
    } else {
        throw new Error(`Cannot find model at ${path}.`);
    }
}


module.exports = { createModel }