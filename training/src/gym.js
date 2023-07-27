const tf = require('@tensorflow/tfjs-node')
const Memory = require('./memory')
const { getPoints, getUnitVector, INPUT_LAYER_SIZE, OUTPUT_LAYER_SIZE } = require('./utils');
const logger = require('./logger')

// Taum is how much of the other networks influence goes into the merger of the networks during the mutation
const ACTOR_TAU = 0.07
const CRITIC_TAU = 0.05

const MAX_STEPS_PER_EPISODE = 1000; // Define a maximum number of steps per episode to avoid infinite loops

const DISCOUNT_RATE = 0.95

const MEMORY_SIZE = 50 // Increase after rewards filter was removed
const BATCH_SIZE = 50

const RECORDING_CHANCE = 1.1 * MEMORY_SIZE / MAX_STEPS_PER_EPISODE

class Gym {
    field
    memory = new Memory(MEMORY_SIZE)

    // We need target Networks and the TAU values because the critic is approaching a q Value prediction of the next step.
    // If the network evaluating this step is the main netowrk and thefore is constantly changing, the main network cannot hone in on a value.
    // The TAU Value is used to smoothen the transition between target and main.
    constructor(actor, targetActor, critic, targetCritic, field) {
        this.field = field
        this.actor = actor
        this.targetActor = targetActor
        this.critic = critic
        this.targetCritic = targetCritic
    }

    updateTargetActor() {
        const actorWeights = this.actor.getLayerWeights()
        this.targetActor.mutate(actorWeights, ACTOR_TAU)
    }

    updateTargetCritic() {
        const criticWeights = this.critic.getLayerWeights()
        this.targetCritic.mutate(criticWeights, CRITIC_TAU)
    }

    computeReward(actorID) {
        // Check for collisions and calculate the reward
        var actionReward = 0
        for (const entity of this.field.collisionsWith(actorID)) {
            const points = getPoints(entity.type, actorID)
            if (points == 0) {
                continue
            }

            this.field.delete(entity.id)

            actionReward += points
        }

        return actionReward
    }

    async collectSamples() {
        this.actor.resetExplorationRate()
        // this.targetActor.resetExplorationRate()
        // this.critic.resetExplorationRate()

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
            const { dir, ai } = this.actor.chooseAction(inputState)
            const dirV = getUnitVector(dir)
            this.field.move(trainingActorID, dirV)

            // console.log(step, dirV, ai)

            // Get next State
            const newFov = this.field.getFOV(trainingActorID)
            const nextInputState = this.field.getInputTensor(newFov, trainingActorID)

            // Observe the action outcome and calculate the reward
            const reward = this.computeReward(trainingActorID)

            // Do not log ant spawning in object
            if (10 < step) {
                score += reward

                // We log the InputTensor and the Output directly
                // Increase the chance of logging rewards: (reward != 0)
                if (Math.random() < RECORDING_CHANCE || reward != 0) {
                    this.memory.record([inputState.clone(), [dir], reward, nextInputState.clone()])
                }

                if (reward != 0) {
                    logger.event(JSON.stringify({ frame: step, action: dirV, reward, ai }))
                }
            }

            inputState.dispose()
            inputState = nextInputState

            // All Resources Empty
            if (!this.field.hasResources()) {
                gameOver = true
            }
        }

        inputState.dispose()

        return score
    }

    async train() {
        var batch = this.memory.sample(BATCH_SIZE)
        const criticLoss = await trainCritic(this.actor, this.critic, this.targetCritic, batch)
        const criticEventCount = batch.filter(([state, action, reward, nextState]) => reward != 0).length

        batch = this.memory.sample(BATCH_SIZE)
        const actorLoss = await trainActor(this.actor, this.critic, batch)

        return { actorLoss, criticLoss, criticEventCount }
    }
}


async function trainCritic(targetActor, critic, targetCritic, batch) {
    const rewards = tf.stack(batch.map(([state, action, reward, nextState]) => reward))
    const nextStates = batch.map(([state, action, reward, nextState]) => nextState)

    const predActions = targetActor.predictMany(nextStates)
    const input = predActions.map((predAction, i) => [nextStates[i], predAction])
    const predNextQ = tf.stack(targetCritic.predictMany(input).map(output => output.asScalar()))
    const targetQ = rewards.add(predNextQ.mul(DISCOUNT_RATE))

    const states = tf.tensor2d(batch.map(([state, action, reward, nextState]) => state.dataSync()), [batch.length, INPUT_LAYER_SIZE])
    const actions = tf.tensor2d(batch.map(([state, action, reward, nextState]) => action), [batch.length, OUTPUT_LAYER_SIZE])

    const info = await critic.train([states, actions], targetQ)

    // Clean Up
    rewards.dispose()
    predActions.forEach(t => t.dispose())
    predNextQ.dispose()
    targetQ.dispose()
    states.dispose()
    actions.dispose()

    return info.history.loss[0] // critic loss
}

async function trainActor(actor, critic, batch) {
    const states = batch.map(([state, action, reward, nextState]) => state)

    var actorLoss
    function loss() {
        const actions = actor.predictMany(states)
        const input = actions.map((action, i) => [states[i], action])
        const predQs = tf.stack(critic.predictMany(input).map(output => output.asScalar()))

        // variableGrads finds minima. We want a maximus, therefore mul loss by -1
        const loss = tf.mean(predQs).mul(-1).asScalar()
        actorLoss = loss.dataSync()[0]

        actions.forEach(t => t.dispose())
        predQs.dispose()

        return loss
    }

    const actorTrainableVars = actor.getWeights(true)
    const actorGradient = tf.variableGrads(loss, actorTrainableVars) // TypeError: Cannot read properties of undefined (reading 'info.backend')
    actor.getOptimizer().applyGradients(actorGradient.grads)
    tf.dispose(actorGradient)

    return actorLoss
}

module.exports = Gym