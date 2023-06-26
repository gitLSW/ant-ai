const Field = require('./field')
const { getPointsForType } = require('./utils');

class Gym {
    // Keep tracking of the elapsed steps to adjust epsilon
    field;

    constructor(model, floorTileDim, win) {
        this.model = model;

        this.field = new Field(win, floorTileDim)
    }

    async start() {
        // Reset the game and obtain the initial state
        var gameOver = false;
        var score = 0;

        // Ready or Reset the game field
        // There will only be one ant with id 'Ant_Player'
        // The id must have at least one _ and must begin with the entity's type
        this.field.reset()

        // Game loop
        while (!gameOver) {
            const inputState = this.field.fovToInputTensor(this.field.getFOV(trainingAntID))

            const output = this.model.predict(inputState)
            const [dx, dy] = output
            this.field.moveBy(trainingAntID, { dx, dy })

            const reward = this.computeReward(trainingAntID)
            score += reward

            // All Ressources Empty
            if (!this.field.hasRessources()) {
                gameOver = true
            }
        }
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
}

module.exports = Gym