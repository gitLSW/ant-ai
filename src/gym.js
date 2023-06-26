const tf = require('@tensorflow/tfjs-node')
const Memory = require('./memory')
const Field = require('./field')
const { getPointsForType } = require('./utils');

const MAX_STEPS_PER_EPISODE = 1500; // Define a maximum number of steps per episode to avoid infinite loops
const DISCOUNT_RATE = 0.9;

const MIN_EPSILON = 0.01;
const MAX_EPSILON = 0.2;
const LAMBDA = 0.01; //LEARNING RATE

const MEMORY_SIZE = 500
const BATCH_SIZE = 100

const INPUT_LAYER_SIZE = 15
const OUTPUT_LAYER_SIZE = 2

// const optimizer = tf.train.adam(LEARNING_RATE);

class Gym {
    memory = new Memory(MEMORY_SIZE)

    // Keep tracking of the elapsed steps to adjust epsilon
    field;
    totalSteps = 0
    explorationRate = MAX_EPSILON // Epsylon

    constructor(model, floorTileDim, win) {
        this.model = model;

        this.field = new Field(win, floorTileDim)
    }

    computeReward(antID) {
        // Check for collisions and calculate the reward
        var actionReward = 0
        for (const entity of this.field.collisionsWith(antID)) {
            const points = getPointsForType(entity.type)
            if (points == 0) {
                continue
            }

            console.log('COLLISION WITH SCORE: ' + points, antID, entity.id)

            this.field.delete(entity.id)

            actionReward += points
        }

        return actionReward
    }

    async runTrainingEpisode() {
        // Reset the game and obtain the initial state
        var gameOver = false;
        var score = 0;

        // Ready or Reset the game field
        // There will only be one ant with id 'Ant_Player'
        // The id must have at least one _ and must begin with the entity's type
        const trainingAntID = 'Ant_Player'
        this.field.reset(trainingAntID)
        let inputState = this.field.getInputTensor(trainingAntID)

        // Game loop
        for (let step = 0; step < MAX_STEPS_PER_EPISODE && !gameOver; step++) {
            // Take random actions with explorationRate probability
            const output = this.model.chooseAction(inputState, this.explorationRate)
            const [dx, dy] = output
            this.field.moveBy(trainingAntID, { dx, dy })

            // Observe the game state and calculate the reward
            const actionReward = this.computeReward(trainingAntID)
            score += actionReward

            // Get next State
            const nextInputState = this.field.getInputTensor(trainingAntID)

            // We log the normalized InputTensor and the normalized Output directly
            this.memory.record([inputState, output, actionReward, nextInputState]);
            inputState = nextInputState

            // Exponentially decay the exploration parameter
            this.totalSteps++
            this.explorationRate = MIN_EPSILON + (MAX_EPSILON - MIN_EPSILON) * Math.exp(-LAMBDA * this.steps);

            // // Apply the reinforcement learning update rule
            // const targetActionV = [actionReward + DISCOUNT_RATE * dirV[0], actionReward + DISCOUNT_RATE * dirV[1]];
            // const chosenActionV = [dirV[0], dirV[1]];
            // const loss = tf.losses.meanSquaredError(targetActionV, chosenActionV);
            // optimizer.minimize(() => loss);

            // // const newPolicy = model.predict(tensorInput);
            // tensorInput.dispose();
            // prediction.dispose();

            // All Ressources Empty
            if (!this.field.hasRessources()) {
                gameOver = true
            }
        }

        await this.replay()
    }

    async replay() {
        // Sample from memory
        const batch = this.memory.sample(BATCH_SIZE);

        const states = batch.map(([state, , ,]) => state);
        const nextStates = batch.map(
            ([, , , nextState]) => nextState ? nextState : tf.zeros([INPUT_LAYER_SIZE])
        );

        // Predict the output of each action at each state
        const qsa = states.map((state) => this.model.predict(state));
        // Predict the output of each action at each next state
        const qsad = nextStates.map((nextState) => this.model.predict(nextState));

        let x = new Array();
        let y = new Array();

        // Update the states rewards with the discounted next states rewards
        batch.forEach(([state, action, reward, nextState], index) => {
            const currentQ = qsa[index];

            // currentQ and action are both output Vectors, why would I want to hash them ?!
            // FAULT: ACTION IS NOT DISCRETE AND qsad DOESN'T NEED TO USE max() BECAUSE IT IS AN AI output (= dirV).
            currentQ[action] = nextState ? reward + DISCOUNT_RATE * qsad[index].max().dataSync() : reward;

            // console.log(currentQ)

            x.push(state.dataSync());
            y.push(currentQ.dataSync());
        });

        // Clean unused tensors
        qsa.forEach(state => state.dispose());
        qsad.forEach(state => state.dispose());

        // Reshape the batches to be fed to the network
        x = tf.tensor2d(x, [x.length, INPUT_LAYER_SIZE])
        y = tf.tensor2d(y, [y.length, OUTPUT_LAYER_SIZE])

        // Learn the Q(s, a) values given associated discounted rewards
        // const history = await this.model.train(x, y);

        // console.log(history)

        x.dispose();
        y.dispose();
    }
}

module.exports = Gym