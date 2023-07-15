const tf = require('@tensorflow/tfjs-node')
const Field = require('./field')
const { getPoints, INPUT_LAYER_SIZE, OUTPUT_LAYER_SIZE } = require('./utils');

const MAX_STEPS_PER_EPISODE = 20; // Define a maximum number of steps per episode to avoid infinite loops

class Game {
    field

    constructor(actor, floorTileDim, win) {
        this.actor = actor
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

    playRound() {
        // Reset the game and obtain the initial state
        var gameOver = false;
        var score = 0;

        // Ready or Reset the game field
        // There will only be one ant with id 'Ant_Player'
        // The id must have at least one _ and must begin with the entity's type
        const trainingActorID = 'Ant_Player'
        this.field.reset(trainingActorID)

        // Game loop
        for (let step = 0; step < MAX_STEPS_PER_EPISODE && !gameOver; step++) {
            const inputState = this.field.getInputTensor(this.field.getFOV(trainingActorID), trainingActorID)

            // Take random actions with explorationRate probability
            const output = this.actor.predict(inputState)
            inputState.dispose()
            const [dx, dy] = output.dataSync()
            this.field.move(trainingActorID, { dx, dy })
            output.dispose()

            // Observe the game state and calculate the reward
            const reward = this.computeReward(trainingActorID)
            score += reward

            // All Ressources Empty
            if (!this.field.hasRessources()) {
                gameOver = true
            }
        }

        console.log('Game End:', score)
    }
}

module.exports = Game