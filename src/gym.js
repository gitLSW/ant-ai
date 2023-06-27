const tf = require('@tensorflow/tfjs-node')
const Memory = require('./memory')
const Field = require('./field')
const { ACTOR_INPUT_LAYER_SIZE, ACTOR_OUTPUT_LAYER_SIZE } = require('./utils');

const MAX_STEPS_PER_EPISODE = 5000; // Define a maximum number of steps per episode to avoid infinite loops

const MEMORY_SIZE = 1500
const BATCH_SIZE = 200

// const optimizer = tf.train.adam(LEARNING_RATE);

function getPointsForType(type) {
    switch (type) {
        case 'Resource':
            return 20;
        case 'Spider':
            return -10;
        default:
            return 0;
    }
}

class Gym {
    field
    memory = new Memory(MEMORY_SIZE)

    constructor(actor, criticModel, floorTileDim, win) {
        this.actor = actor;
        this.targetactor = actor; // The actual actor to train

        // Used to contain Back Propagation Results for Gradient Ascent along the Fitness Function
        // To do this we compute the partial differential of the Fitness Function with respect to each weight and bias: dFitness/dParameter Fitness(NeuralNet(Parameter)) = ...
        this.actorCriticGrad = tf.input({ shape: [null, ACTOR_OUTPUT_LAYER_SIZE], dtype: 'float32' }); // where we will feed de/dC (from critic) e: MeanSquaredError, C: Critic

        const actorWeights = this.actor.getWeights();
        console.log('TRAINABLE WEIGHTS:', actorWeights, this.actor.trainable)
        console.log('OUTPUT LAYER:', this.actor.output)

        // Next two lines might not work:
        this.actorGrads = tf.grads(() => this.actor.apply(this.actor_state_input), actorWeights, this.actorCriticGrad);
        const grads = actor_model_weights.map((weight, index) => [this.actor_grads[index], weight]);

        // Check original Video: Our code is different:
        // let actorGrads = tf
        //     .grads(() => this.actor.output)(actorWeights) // partially differentiates the actor model with regard to each weight and returns a Vector of these differntials for each weight
        //     .map(grad => tf.mul(grad, tf.scalar(-1))); // Multiply each differntial by -1
        // let grads = actorGrads.map((grad, i) => [grad, actor_model_weights[i]]);


        this.optimize = tf.train.adam(this.learning_rate).applyGradients(grads);

        [this.critic_state_input, this.critic_action_input, this.critic_model] = this.createCriticModel();
        [, , this.target_critic_model] = this.createCriticModel();

        this.critic_grads = tf.grads(() => this.critic_model.apply([this.critic_state_input, this.critic_action_input]), this.critic_action_input);

        this.sess = tf.engine().startScope();
        this.sess.run(tf.globalVariablesInitializer());

        let optimize = tf.train.adam(this.learning_rate).applyGradients(grads);

        // Critic Model
        let [critic_state_input, critic_action_input, critic_model] = this.create_critic_model();
        let [, , target_critic_model] = this.create_critic_model();

        let critic_grads = tf.grads(() => critic_model.output)(critic_action_input);

        await tf.node.initializeAllVariables(this.sess);


        this.criticModel = criticModel;

        this.field = new Field(win, floorTileDim)
    }

    computeReward(actorID) {
        // Check for collisions and calculate the reward
        var actionReward = 0
        for (const entity of this.field.collisionsWith(actorID)) {
            const points = getPointsForType(entity.type)
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
        let inputState = this.field.getInputTensor(trainingActorID)

        // Game loop
        for (let step = 0; step < MAX_STEPS_PER_EPISODE && !gameOver; step++) {
            // Take random actions with explorationRate probability
            const action = this.actor.chooseAction(inputState)
            const [dx, dy] = action
            this.field.moveBy(trainingActorID, { dx, dy })

            // Observe the game state and calculate the reward
            const reward = this.computeReward(trainingActorID)
            score += reward

            // Get next State
            const nextInputState = this.field.getInputTensor(trainingActorID)

            // We log the normalized InputTensor and the normalized Output directly
            this.memory.record([inputState, action, reward, nextInputState]);
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

        // await this.replay()
    }


    async trainCritic() {
        const batch = this.memory.sample(BATCH_SIZE);
        batch.forEach(([state, action, reward, newState]) => {
            const predictedAction = this.actor.predict(state)
            if (newState) {
                // HE HAS A FUCKING DIFFERNT target_critic_model AND critic_model
                const targetAction = self.
            }
            const grads = this.sess
        })
    }



    // async replay() {
    //     // Sample from memory
    //     const batch = this.memory.sample(BATCH_SIZE);

    //     const states = batch.map(([state, , ,]) => state);
    //     const nextStates = batch.map(
    //         ([, , , nextState]) => nextState ? nextState : tf.zeros([INPUT_LAYER_SIZE])
    //     );

    //     // Predict the output of each action at each state
    //     const qsa = states.map((state) => this.actor.predict(state));
    //     // Predict the output of each action at each next state
    //     const qsad = nextStates.map((nextState) => this.actor.predict(nextState));

    //     let x = new Array();
    //     let y = new Array();

    //     // Update the states rewards with the discounted next states rewards
    //     batch.forEach(([state, action, reward, nextState], index) => {
    //         const currentQ = qsa[index];

    //         // currentQ and action are both output Vectors, why would I want to hash them ?!
    //         // FAULT: ACTION IS NOT DISCRETE AND qsad DOESN'T NEED TO USE max() BECAUSE IT IS AN AI output (= dirV).
    //         currentQ[action] = nextState ? reward + DISCOUNT_RATE * qsad[index].max().dataSync() : reward;

    //         // console.log(currentQ)

    //         x.push(state.dataSync());
    //         y.push(currentQ.dataSync());
    //     });

    //     // Clean unused tensors
    //     qsa.forEach(state => state.dispose());
    //     qsad.forEach(state => state.dispose());

    //     // Reshape the batches to be fed to the network
    //     x = tf.tensor2d(x, [x.length, INPUT_LAYER_SIZE])
    //     y = tf.tensor2d(y, [y.length, OUTPUT_LAYER_SIZE])

    //     // Learn the Q(s, a) values given associated discounted rewards
    //     // const history = await this.actor.train(x, y);

    //     // console.log(history)

    //     x.dispose();
    //     y.dispose();
    // }
}

module.exports = Gym