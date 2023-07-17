const tf = require('@tensorflow/tfjs-node')
const { MODEL_PATH, INPUT_LAYER_SIZE, OUTPUT_LAYER_SIZE } = require('./utils')
const { readdir } = require('fs/promises')

const EPSILON = 1
const EPSILON_DECAY = 0.995

const NUMBER_DIRECTIONS = 16
const LEARNING_RATE = 0.05

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
        return this.network.predict(input)
    }

    act(input) {
        const output = this.predict(input)
        const action = output.dataSync()[0]
        output.dispose()
        
        return action
    }

    // Converts the output Vector of the NN to a number between [0, 15] using angles
    // approximateDirection(output) {
    //     const [dx, dy] = output
    //     var angle = Math.atan2(dy, dx)
    //     if (angle < 0) {
    //         angle += 2 * Math.PI // Convert negative angles to positive (clockwise)
    //     }
    //     return tf.oneHot(Math.floor(angle / (2 * Math.PI / NUMBER_DIRECTIONS)), NUMBER_DIRECTIONS)
    // }

    /**
     * @param {tf.Tensor[]} xBatch
     * @param {tf.Tensor[]} yBatch
     */
    async train(xBatch, yBatch) {
        return await this.network.fit(xBatch, yBatch, {
            // epochs: 5,
            // batchSize: 32,
            // callbacks: { onBatchEnd: (batch, logs) => console.log(logs) }
        });
    }

    /**
     * @param {tf.Tensor} input
     * @returns {number[]} The action chosen by the model: Scalar between 0 to 1
     */
    chooseAction(input) {
        // Exponentially decay the exploration parameter
        this.explorationRate *= EPSILON_DECAY

        if (Math.random() < this.explorationRate) {
            return Math.random()
        }

        return this.act(input)
    }

    // Generate vector of random numbers between 0 and 1
    // generateRandomOutput() {
    //     return tf.randomUniform([OUTPUT_LAYER_SIZE], 0, 1).arraySync()
    // }

    getWeights(trainable = false) {
        return this.network.getWeights(trainable);
    }

    getOptimizer() {
        return this.network.optimizer
    }

    async save(modelName) {
        try {
            await this.network.save(`file://${MODEL_PATH}/${modelName}`)
        } catch {
            console.log('FAILED TO SAVE')
        }
    }
}


async function loadModel(modelName, optimizer) {
    console.log(`Loading AI model ${modelName} from ${MODEL_PATH}...`)
    const network = await tf.loadLayersModel(`file://${MODEL_PATH}/${modelName}/model.json`)

    console.log(modelName)
    network.summary()

    network.compile({ optimizer, loss: 'meanSquaredError' })

    return new AIModel(network)
}

async function findNewestModel(modelType) {
    const regex = new RegExp(`^${modelType}_\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}.\\d{3}Z$`)
    const directories = (await readdir(MODEL_PATH, { withFileTypes: true }))
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)
        .filter(name => regex.test(name))
        .sort((a, b) => b.localeCompare(a)); // Sort directories in descending order

    if (0 < directories.length) {
        return directories[0]; // Return only the latest version
    } else {
        return null; // No matching subdirectories found
    }
}

async function createActorModel() {
    try {
        const newestModelName = await findNewestModel('actor')
        return await loadModel(newestModelName, 'adam')
    } catch (e) {
        console.log(e)

        console.log(`Failed to load AI model, generating a new Actor Model instead...`)
        const network = tf.sequential({
            layers: [
                // Input Layer
                tf.layers.inputLayer({ inputShape: [INPUT_LAYER_SIZE], activation: 'linear' }),

                // Hidden Layers
                tf.layers.dense({ units: 25, activation: 'relu6' }),
                tf.layers.dense({ units: 20, activation: 'sigmoid' }),
                tf.layers.dense({ units: 10, activation: 'sigmoid' }),

                // the Network spits out a scalar between 0 and 1 that gets converted to a unit vector denoting the movement direction
                tf.layers.dense({ units: OUTPUT_LAYER_SIZE, activation: 'linear' }),
                tf.layers.reLU({ maxValue: 1 })
            ]
        });

        network.compile({ optimizer: 'adam', loss: 'meanSquaredError' });

        return new AIModel(network)
    }
}

async function createCriticModel() {
    try {
        const newestModelName = await findNewestModel('critic')
        return await loadModel(newestModelName, 'sgd')
    } catch (e) {
        console.log(e)

        console.log(`Failed to load AI model, generating a new Critic Model instead...`)
        const stateInput = tf.input({ shape: [INPUT_LAYER_SIZE], name: 'state' });
        const stateH1 = tf.layers.dense({ units: 20, activation: 'relu' }).apply(stateInput);
        const stateH2 = tf.layers.dense({ units: 15, activation: 'relu6' }).apply(stateH1);

        const actionInput = tf.input({ shape: [OUTPUT_LAYER_SIZE], name: 'action' });
        const actionH1 = tf.layers.dense({ units: 5, activation: 'sigmoid' }).apply(actionInput);

        const concatenated = tf.layers.concatenate().apply([stateH2, actionH1]);

        const output = tf.layers.dense({ units: 1, activation: 'linear' }).apply(concatenated);

        // Create the model
        const network = tf.model({ inputs: [stateInput, actionInput], outputs: output });

        // const sgd = tf.train.sgd(LEARNING_RATE)
        network.compile({ optimizer: 'sgd', loss: 'meanSquaredError' });

        return new AIModel(network)
    }
}

module.exports = { createActorModel, createCriticModel }