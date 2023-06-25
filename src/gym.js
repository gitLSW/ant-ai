const tf = require('@tensorflow/tfjs-node')
const Memory = require('./memory')
const Field = require('./field')
const { getPointsForType } = require('./utils');

const MAX_STEPS_PER_EPISODE = 1500; // Define a maximum number of steps per episode to avoid infinite loops
const LEARNING_RATE = 0.001;
const DISCOUNT_RATE = 0.99;
const MIN_EPSILON = 0.01;
const MAX_EPSILON = 0.2;
const LAMBDA = 0.01;

const MEMORY_SIZE = 500
const BATCH_SIZE = 100

const INPUT_LAYER_SIZE = 15
const OUTPUT_LAYER_SIZE = 2

class Gym {
    memory = new Memory(MEMORY_SIZE)

    // Keep tracking of the elapsed steps to adjust epsilon
    field;
    totalSteps = 0
    explorationRate = MAX_EPSILON // Epsylon

    scoreStore = new Array();

    constructor(model, floorTileDim, win) {
        this.model = model;

        this.field = new Field(win, floorTileDim)
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
        let inputState = this.field.fovToInputTensor(this.field.getFOV(trainingAntID))

        // Game loop
        for (let step = 0; step < MAX_STEPS_PER_EPISODE && !gameOver; step++) {
            // Take random actions with explorationRate probability
            const dirV = this.model.chooseAction(inputState, this.explorationRate)
            this.field.moveBy(trainingAntID, dirV)

            const reward = this.computeReward(trainingAntID)
            score += reward
            
            // Get next State
            const nextInputState = this.field.fovToInputTensor(this.field.getFOV(trainingAntID))

            // We log the normalized InputTensor and the normalized Output directly
            this.memory.record([inputState, dirV, reward, nextInputState]);
            inputState = nextInputState

            // Exponentially decay the exploration parameter
            this.totalSteps++
            this.explorationRate = MIN_EPSILON + (MAX_EPSILON - MIN_EPSILON) * Math.exp(-LAMBDA * this.steps);

            // // Update the AI's policy
            // const tensorInput = tf.tensor2d([dirV.dx, dirV.dy], [1, 2]);
            // const prediction = model.predict(tensorInput);
            // // const oldPolicy = prediction.clone();

            // // Apply the reinforcement learning update rule
            // const target = actionReward + discountFactor * prediction.max().dataSync()[0];
            // const loss = tf.losses.meanSquaredError(target, prediction);
            // optimizer.minimize(() => loss);

            // // const newPolicy = model.predict(tensorInput);
            // tensorInput.dispose();
            // prediction.dispose();
            // // newPolicy.dispose();

            // All Ressources Empty
            if (!this.field.hasRessources()) {
                gameOver = true
            }
        }

        this.scoreStore.push(score);

        await this.replay()
    }

    computeReward(antID) {
        // Check for collisions and calculate the reward
        var actionReward = 0
        for (const entity of this.field.collisionsWith(antID)) {
            const points = getPointsForType(entity.type)
            if (points == 0) {
                continue
            }

            console.log('COLLISION WITH SCORE: ' + points, ant.id, entity.id)

            this.field.delete(entity.id)

            actionReward += points
        }

        return actionReward
    }

    async replay() {
        // Sample from memory
        const batch = this.memory.sample(BATCH_SIZE);
        const states = batch.map(([state, , ,]) => state);
        const nextStates = batch.map(
            ([, , , nextState]) => nextState ? nextState : tf.zeros([INPUT_LAYER_SIZE])
        );
        // Predict the values of each action at each state
        const qsa = states.map((state) => this.model.predict(state));
        // Predict the values of each action at each next state
        const qsad = nextStates.map((nextState) => this.model.predict(nextState));

        let x = new Array();
        let y = new Array();

        // Update the states rewards with the discounted next states rewards
        batch.forEach(
            ([state, action, reward, nextState], index) => {
                const currentQ = qsa[index];
                currentQ[action] = nextState ? reward + DISCOUNT_RATE * qsad[index].max().dataSync() : reward;
                x.push(state.dataSync());
                y.push(currentQ.dataSync());
            }
        );

        // Clean unused tensors
        qsa.forEach(state => state.dispose());
        qsad.forEach(state => state.dispose());

        // Reshape the batches to be fed to the network
        x = tf.tensor2d(x, [x.length, INPUT_LAYER_SIZE])
        y = tf.tensor2d(y, [y.length, OUTPUT_LAYER_SIZE])

        // Learn the Q(s, a) values given associated discounted rewards
        await this.model.train(x, y);

        x.dispose();
        y.dispose();
    }
}

module.exports = Gym