const tf = require('@tensorflow/tfjs-node')
const Memory = require('./memory')
const Field = require('./field')
const { getPoints, INPUT_LAYER_SIZE, OUTPUT_LAYER_SIZE } = require('./utils');

const MAX_STEPS_PER_EPISODE = 5000; // Define a maximum number of steps per episode to avoid infinite loops

const DISCOUNT_RATE = 0.95

const MEMORY_SIZE = 1500
const BATCH_SIZE = 200

// const LEARNING_RATE = 0.05
// const optimizer = tf.train.adam(LEARNING_RATE);
// const criticOptimizer = tf.train.sgd(LEARNING_RATE)

class Gym {
    field
    memory = new Memory(MEMORY_SIZE)

    constructor(actor, critic, floorTileDim, win) {
        this.actor = actor
        this.critic = critic
        this.targetactor = actor // The actual actor to train
        this.field = new Field(win, floorTileDim)
    }

    computeReward(actorID) {
        // Check for collisions and calculate the reward
        var actionReward = 0
        for (const entity of this.field.collisionsWith(actorID)) {
            const points = getPoints(entity.type, actorID)
            if (points == 0) {
                continue
            }

            console.log('COLLISION WITH SCORE: ' + points, actorID, entity.id)

            this.field.delete(entity.id)

            actionReward += points
        }

        return actionReward
    }

    // bestFutureReward(fov, actorID) {
    //     return fov
    //         .slice(0, NUMBER_ENTITIES_IN_FOV) // Always the 5 closest Collsions
    //         .reduce((maxRewardEntity, entity) => {
    //             // IMPORTANT: Instead of the classical Discount Factor, we apply a distance / speed discount:
    //             const DISTANCE_DECAY = 0.1
    //             entity.reward = getPoints(entity.type, actorID) * Math.exp(-DISTANCE_DECAY * entity.distance / getMovementSpeed(entity.type))
    //             return maxRewardEntity.reward < entity.reward ? entity : maxRewardEntity
    //         }, fov[0])
    //         .reward
    // }

    async collectSamples() {
        // Reset the game and obtain the initial state
        var gameOver = false;
        var score = 0;

        // Ready or Reset the game field
        // There will only be one ant with id 'Ant_Player'
        // The id must have at least one _ and must begin with the entity's type
        const trainingActorID = 'Ant_Player'
        this.field.reset(trainingActorID)

        let inputState = this.field.getInputTensor(this.field.getFOV(trainingActorID), trainingActorID)

        // Game loop
        for (let step = 0; step < MAX_STEPS_PER_EPISODE && !gameOver; step++) {
            // Take random actions with explorationRate probability
            const [dx, dy] = this.actor.chooseAction(inputState)
            this.field.move(trainingActorID, { dx, dy })

            // Observe the game state and calculate the reward
            const reward = this.computeReward(trainingActorID)
            score += reward

            // Get next State
            const newFov = this.field.getFOV(trainingActorID)
            const nextInputState = this.field.getInputTensor(newFov, trainingActorID)

            // We log the InputTensor and the Output directly
            // const bestFutureReward = this.bestFutureReward(newFov, trainingActorID)
            // const approximatedDirection = this.actor.approximateDirection([dx, dy]).dataSync()
            this.memory.record([inputState, [dx, dy], reward, nextInputState])
            inputState = nextInputState

            // // Apply the reinforcement learning update rule
            // const targetActionV = [reward + DISCOUNT_RATE * dirV[0], reward + DISCOUNT_RATE * dirV[1]];
            // const chosenActionV = [dirV[0], dirV[1]];
            // const loss = tf.losses.meanSquaredError(targetActionV, chosenActionV);
            // optimizer.minimize(() => loss);

            // // const newPolicy = actor.predict(tensorInput);
            // tensorInput.dispose();
            // prediction.dispose();

            // All Ressources Empty
            if (!this.field.hasRessources()) {
                gameOver = true
            }
        }
    }

    async trainCritic() {
        const batch = this.memory.sample(BATCH_SIZE)

        var states = batch.map(([state, action, reward, nextState]) => state.dataSync())
        var actions = batch.map(([state, action, reward, nextState]) => action)
        var actualRewards = batch.map(([state, action, reward, nextState]) => reward ?? 0)

        states = tf.tensor2d(states, [states.length, INPUT_LAYER_SIZE])
        actions = tf.tensor2d(actions, [actions.length, OUTPUT_LAYER_SIZE])
        actualRewards = tf.tensor2d(actualRewards, [actualRewards.length, 1])
        
        const history = await this.critic.train([states, actions], actualRewards)
        console.log(history)

        console.log('I AM A GENIUS')

        // input.forEach(([state, action]) => {
        //     state.dispose()
        //     action.dispose()
        // });
    }

    async replay() {
        // Sample from memory
        const batch = this.memory.sample(BATCH_SIZE);

        // action is the approximatedDirection
        const states = batch.map(([state, action, reward, nextState]) => state);
        const nextStates = batch.map(
            ([state, action, reward, nextState]) => nextState ? nextState : tf.zeros([INPUT_LAYER_SIZE])
        );

        // Predict the output of each action at each state
        const qsa = states.map(state => this.actor.approximateDirection(this.actor.predict(state).dataSync()));
        // Predict the reward for of each action at each next state
        const qsad = nextStates.map(nextState => {
            return this.actor.approximateDirection(this.actor.predict(nextState).dataSync())
        });

        let x = new Array();
        let y = new Array();

        // Update the states rewards with the discounted next states rewards
        batch.forEach(([state, action, reward, nextState], index) => {
            const currentQ = qsa[index]

            // ERROR: This does not work: 
            currentQ[action] = nextState ? reward + DISCOUNT_RATE * qsad[index].max().dataSync() : reward

            currentQ.print()

            x.push(state.dataSync())
            y.push(currentQ.dataSync())
        });

        // Clean unused tensors
        qsa.forEach(state => state.dispose());
        qsad.forEach(state => state.dispose());

        // Reshape the batches to be fed to the network
        x = tf.tensor2d(x, [x.length, INPUT_LAYER_SIZE])
        y = tf.tensor2d(y, [y.length, OUTPUT_LAYER_SIZE])

        // Learn the Q(s, a) values given associated discounted rewards
        // const history = await this.actor.train(x, y);

        // console.log(history)

        x.dispose();
        y.dispose();
    }
}

module.exports = Gym