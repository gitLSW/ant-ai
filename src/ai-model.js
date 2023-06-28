const tf = require('@tensorflow/tfjs-node')
// const path = require('path')
const { INPUT_LAYER_SIZE, OUTPUT_LAYER_SIZE } = require('./utils');


// const modelPath = path.resolve(__dirname + '/../ai-models').toString()

const EPSILON = 1
const EPSILON_DECAY = 0.95

const NUMBER_DIRECTIONS = 16

class AIModel {
    explorationRate = EPSILON

    constructor(network) {
        this.network = network
    }

    /**
     * @param {tf.Tensor | tf.Tensor[]} states
     * @returns {tf.Tensor | tf.Tensor} The predictions of the best actions
     */
    predict(input) {
        return tf.tidy(() => this.network.predict(input));
    }

    // Converts the output Vector of the NN to a number between [0, 15] using angles
    approximateDirection(output) {
        const [dx, dy] = output
        var angle = Math.atan2(dy, dx)
        if (angle < 0) {
            angle += 2 * Math.PI // Convert negative angles to positive (clockwise)
        }
        return tf.oneHot(Math.floor(angle / (2 * Math.PI / NUMBER_DIRECTIONS)), NUMBER_DIRECTIONS)
    }

    /**
     * @param {tf.Tensor[]} xBatch
     * @param {tf.Tensor[]} yBatch
     */
    async train(xBatch, yBatch) {
        return await this.network.fit(xBatch, yBatch, {
            batchSize: 10,
            epochs: 50
        });
    }

    /**
     * @param {tf.Tensor} input
     * @returns {number[]} The action chosen by the model: Directional Vector with dx and dy between -1 - 1
     */
    chooseAction(input) {
        // Exponentially decay the exploration parameter
        this.explorationRate *= EPSILON_DECAY

        return (Math.random() < this.explorationRate) ?
            [Math.random() * 2 - 1, Math.random() * 2 - 1] :
            this.predict(input).dataSync()
    }

    // Generate vector of random numbers between 0 and 1
    // generateRandomOutput() {
    //     return tf.randomUniform([OUTPUT_LAYER_SIZE], 0, 1).arraySync()
    // }

    print() {
        const layer = this.network.getLayer(undefined, 1);
        const weights = layer.getWeights()[0];
        const biases = layer.getWeights()[1];

        // Print the weights and biases
        console.log('Weights:');
        weights.print();
        console.log('Biases:');
        biases.print();
    }
}

async function loadModel(path) {
    const modelsInfo = await tf.io.listModels();
    if (path in modelsInfo) {
        console.log(`Loading AI model from ${modelPath}...`)

        const network = new AIModel(await tf.loadLayersModel(path))
        network.compile({ optimizer: 'adam', loss: 'meanSquaredError' })

        return network
    } else {
        throw new Error(`Cannot find model at ${path}.`);
    }
}

async function createActorModel(path) {
    if (!path) {
        const network = tf.sequential({
            layers: [
                // Input Layer
                tf.layers.inputLayer({ inputShape: [INPUT_LAYER_SIZE], activation: 'linear' }),

                // Hidden Layers
                tf.layers.dense({ units: 30, activation: 'relu' }),
                tf.layers.dense({ units: 25, activation: 'relu6' }),
                tf.layers.dense({ units: 25, activation: 'sigmoid' }),
                tf.layers.dense({ units: 15, activation: 'relu' }),

                // Output Layer is one of 16 directions and the speed at which the actor would like to move there (between 0 and 1)
                // denoting how fast in which direction relative to max speed the AI wants to walk
                tf.layers.dense({ units: OUTPUT_LAYER_SIZE, activation: 'sigmoid' })
            ]
        });

        network.compile({ optimizer: 'adam', loss: 'meanSquaredError' });

        return new AIModel(network)
    }

    return await loadModel(path)
}

module.exports = { createActorModel }