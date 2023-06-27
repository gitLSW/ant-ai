const tf = require('@tensorflow/tfjs-node')
// const path = require('path')
const { ACTOR_INPUT_LAYER_SIZE, ACTOR_OUTPUT_LAYER_SIZE } = require('./utils');


// const modelPath = path.resolve(__dirname + '/../ai-models').toString()

const EPSILON = 1
const EPSILON_DECAY = 0.95

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


    // WHY DID HE USE TWI DIFFERENT OUTPUTS IN HIS TUTORIAL ?!!
    /**
     * @param {tf.Tensor} state
     * @returns {number} The action chosen by the model (-1 | 0 | 1)
     */
    // chooseAction(state, eps) {
    //     if (Math.random() < eps) {
    //         return Math.floor(Math.random() * this.numActions) - 1;
    //     } else {
    //         return tf.tidy(() => {
    //             const logits = this.network.predict(state);
    //             const sigmoid = tf.sigmoid(logits);
    //             const probs = tf.div(sigmoid, tf.sum(sigmoid));
    //             return tf.multinomial(probs, 1).dataSync()[0] - 1;
    //         });
    //     }
    // }

    // predict(states) {
    //     return tf.tidy(() => this.network.predict(states));
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
                tf.layers.inputLayer({ inputShape: [ACTOR_INPUT_LAYER_SIZE], activation: 'linear' }),

                // Hidden Layers
                tf.layers.dense({ units: 30, activation: 'relu' }),
                tf.layers.dense({ units: 25, activation: 'relu6' }),
                tf.layers.dense({ units: 25, activation: 'sigmoid' }),
                tf.layers.dense({ units: 15, activation: 'relu' }),

                // Output Layer is a vector with dx and dy between -1 and 1,
                // denoting how fast in which direction relative to max speed the AI wants to walk
                tf.layers.dense({ units: ACTOR_OUTPUT_LAYER_SIZE, activation: 'tanh' })
            ]
        });

        network.compile({ optimizer: 'adam', loss: 'meanSquaredError' });

        return new AIModel(network)
    }

    return await loadModel(path)
}

async function createCriticModel(path) {
    if (!path) {
        const stateInput = tf.layers.inputLayer({ inputShape: [ACTOR_INPUT_LAYER_SIZE], activation: 'linear' })
        const stateH1 = tf.layers.dense({ units: 20 }).apply(stateInput)
        const stateH2 = tf.layers.dense({ units: 15, activation: 'relu' }).apply(stateH1)

        const actorActionInput = tf.layers.inputLayer({ inputShape: [ACTOR_OUTPUT_LAYER_SIZE], activation: 'linear' })
        // const actorActionH1 = tf.layers.dense({ units: 5 }).apply(actorActionInput)

        const merged = tf.layers.concatenate().apply([stateH2, actorActionInput])
        const mergedH1 = tf.layers.dense({ units: 12, activation: 'relu' }).apply(merged)
        const output = tf.layers.dense({ units: 1, activation: 'relu' }).apply(mergedH1)

        const network = tf.model({ inputs: input, outputs: output })

        network.compile({ optimizer: 'adam', loss: 'meanSquaredError' });

        return new AIModel(network)
    }

    return await loadGraphModel(path)
}

module.exports = { createActorModel, createCriticModel }