const tf = require('@tensorflow/tfjs-node')
const Memory = require('./memory')
const Field = require('./field')
const { getPoints, INPUT_LAYER_SIZE, OUTPUT_LAYER_SIZE } = require('./utils');

const MAX_STEPS_PER_EPISODE = 5000; // Define a maximum number of steps per episode to avoid infinite loops

const DISCOUNT_RATE = 0.95

const MEMORY_SIZE = 1500
const BATCH_SIZE = 200

class Gym {
    field
    memory = new Memory(MEMORY_SIZE)

    constructor(actor, critic, floorTileDim, win) {
        this.actor = actor
        this.targetActor = actor // The actual actor to train
        this.critic = critic
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
            const [dx, dy] = this.actor.chooseAction(inputState.clone())
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
            this.memory.record([inputState.clone(), [dx, dy], reward, nextInputState.clone()])
            inputState.dispose()
            inputState = nextInputState.clone()

            // All Ressources Empty
            if (!this.field.hasRessources()) {
                gameOver = true
            }

            nextInputState.dispose()
        }

        inputState.dispose()
    }

    async train() {
        var batch = this.memory.sample(BATCH_SIZE)
        await trainCritic(this.actor, this.critic, batch)
        batch = this.memory.sample(BATCH_SIZE)
        await trainActor(this.actor, this.critic, batch)
    }
}

// WHY IS THE LOSS OF CRITIC A NaN SOMETIMES ?
async function trainCritic(targetActor, critic, batch) {
    tf.engine().startScope()

    var states = batch.map(([state, action, reward, nextState]) => state)
    var actions = batch.map(([state, action, reward, nextState]) => action)
    var actualRewards = batch.map(([state, action, reward, nextState]) => {
        // We want the critic to find the qValue = reward + discount * future_reward
        if (nextState && 0.01 < DISCOUNT_RATE) {
            const targetAction = targetActor.predict(state)
            const criticPred = critic.predict([nextState, targetAction])
            const predQValue = criticPred.arraySync()[0][0]
            criticPred.dispose()
            return reward + DISCOUNT_RATE * predQValue
        }

        return reward
    })

    // Transform the arrays to 2D Tensors
    states = tf.tensor2d(states.map(state => state.arraySync()[0]), [states.length, INPUT_LAYER_SIZE])
    actions = tf.tensor2d(actions, [actions.length, OUTPUT_LAYER_SIZE])
    actualRewards = tf.tensor2d(actualRewards, [actualRewards.length, 1])

    const Tm = await critic.train([states, actions], actualRewards)
    console.log(Tm.history.loss)

    tf.engine().endScope()

    // Clean Up
    states.dispose()
    actions.dispose()
    actualRewards.dispose()

    console.log('RISE !!!!')
}

async function trainActor(actor, critic, batch) {
    function loss() {
        return tf.tidy(() => {
            var predQ = batch.map(([state, action, reward, nextState]) => {
                const actorOutput = actor.predict(state)
                const predQValue = critic.predict([state, actorOutput]).asScalar()
                actorOutput.dispose()
                return predQValue
            })
            predQ = tf.stack(predQ)

            // MAKES NO SENSE
            return tf.mean(predQ.mul(-1)).asScalar()
        });
    }

    const actorTrainableVars = actor.getWeights(true)
    const actorGradient = tf.variableGrads(loss, actorTrainableVars) // TypeError: Cannot read properties of undefined (reading 'info.backend')
    actor.getOptimizer().applyGradients(actorGradient.grads)
    tf.dispose(actorGradient)

    console.log('PRAISE THE LORD !!!')
}

module.exports = Gym