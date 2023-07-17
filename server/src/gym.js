const tf = require('@tensorflow/tfjs-node')
const Memory = require('./memory')
const { getPoints, getUnitVector, INPUT_LAYER_SIZE, OUTPUT_LAYER_SIZE } = require('./utils');

const MAX_STEPS_PER_EPISODE = 5000; // Define a maximum number of steps per episode to avoid infinite loops

const DISCOUNT_RATE = 0.95

const MEMORY_SIZE = 1500
const BATCH_SIZE = 100

const RECORDING_CHANCE = MEMORY_SIZE / MAX_STEPS_PER_EPISODE

class Gym {
    field
    memory = new Memory(MEMORY_SIZE)

    constructor(actor, critic, field, io) {
        this.io = io
        this.actor = actor
        this.targetActor = actor // The actual actor to train
        this.critic = critic
        this.field = field
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
            const action = this.actor.chooseAction(inputState.clone())
            this.field.move(trainingActorID, getUnitVector(action))

            // Observe the game state and calculate the reward
            const reward = this.computeReward(trainingActorID)
            score += reward

            // Get next State
            const newFov = this.field.getFOV(trainingActorID)
            const nextInputState = this.field.getInputTensor(newFov, trainingActorID)

            // We log the InputTensor and the Output directly
            if (Math.random() < RECORDING_CHANCE || reward != 0) {
                this.memory.record([inputState.clone(), action, reward, nextInputState.clone()])
            }

            inputState.dispose()
            inputState = nextInputState.clone()

            // All Resources Empty
            if (!this.field.hasResources()) {
                gameOver = true
            }

            nextInputState.dispose()

            // this.io.emit("update state", this.field.serialize());
        }

        inputState.dispose()

        return score
    }

    async train() {
        var batch = this.memory.sample(BATCH_SIZE)
        const criticLoss = await trainCritic(this.actor, this.critic, batch)
        batch = this.memory.sample(BATCH_SIZE)
        const actorLoss = await trainActor(this.actor, this.critic, batch)

        return { actorLoss, criticLoss }
    }
}

// WHY IS THE LOSS OF CRITIC A NaN SOMETIMES ?
async function trainCritic(targetActor, critic, batch) {
    var states = batch.map(([state, action, reward, nextState]) => state)
    var actions = batch.map(([state, action, reward, nextState]) => action)
    var actualRewards = batch.map(([state, action, reward, nextState]) => {
        // We want the critic to find the qValue = reward + discount * future_reward
        if (nextState && 0.01 < DISCOUNT_RATE) {
            // const currCriticPred = critic.predict([state, tf.tensor(action)])
            // const currQValue = currCriticPred.arraySync()[0][0]
            // currCriticPred.dispose()

            const targetAction = targetActor.predict(nextState)
            const criticPred = critic.predict([nextState, targetAction])
            const predQValue = criticPred.arraySync()[0][0]
            criticPred.dispose()
            return reward + DISCOUNT_RATE * predQValue
        }

        return reward
    })

    // Transform the arrays to 2D Tensors
    states = tf.tensor2d(states.map(state => state.arraySync()[0]), [states.length, INPUT_LAYER_SIZE])
    actions = tf.tensor(actions, [actions.length, OUTPUT_LAYER_SIZE])
    actualRewards = tf.tensor2d(actualRewards, [actualRewards.length, 1])

    const Tm = await critic.train([states, actions], actualRewards)
    const loss = Tm.history.loss[0]

    // Clean Up
    states.dispose()
    actions.dispose()
    actualRewards.dispose()

    return loss
}

async function trainActor(actor, critic, batch) {
    var actorLoss
    function loss() {
        return tf.tidy(() => {
            var predQ = batch.map(([state, action, reward, nextState]) => {
                const actorOutput = actor.predict(state)
                const predQValue = critic.predict([state, actorOutput]).asScalar()

                actorOutput.dispose()
                return predQValue
            })
            predQ = tf.stack(predQ)

            const loss = tf.mean(predQ.mul(-1)).asScalar()
            actorLoss = loss.dataSync()[0]

            return loss
        });
    }

    const actorTrainableVars = actor.getWeights(true)
    const actorGradient = tf.variableGrads(loss, actorTrainableVars) // TypeError: Cannot read properties of undefined (reading 'info.backend')
    actor.getOptimizer().applyGradients(actorGradient.grads)
    tf.dispose(actorGradient)

    return actorLoss
}

module.exports = Gym