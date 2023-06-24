const { QMainWindow, QWidget } = require("@nodegui/nodegui")
const { reactTo } = require('./ai-control')
const getAntVisibles = require('./ai-input')
const { populateField, setupBackground, clearField } = require('./field-manager')


const floorTileDim = 120
const worldTileNum = 6
const worldSize = { width: floorTileDim * worldTileNum, height: floorTileDim * worldTileNum }

const win = new QMainWindow()
win.setFixedSize(worldSize.width, worldSize.height)

const background = new QWidget(win)
background.setGeometry(0, 0, worldSize.width, worldSize.height)

setupBackground(background, floorTileDim, worldTileNum)

// Game RunLoop
var field
for (let episode = 0; episode < 100; episode++) {
    // Reset the game and obtain the initial state
    var gameOver = false
    var score = 0

    field?.delete()
    field = new QWidget(win)
    field.setGeometry(0, 0, worldSize.width, worldSize.height)
    populateField(field, worldSize)

    // Game loop
    while (!gameOver) {
        try {
            const entities = field.children()
            for (const entry of Object.entries(getAntVisibles(entities))) {
                // const ant = entry[0]
                
                const fovEntities = entry[1]
                const dirV = reactTo(fovEntities, worldSize)

                // Observe the game state and calculate the reward
                console.log(dirV)

                // Update the AI and get the chosen action
            }

            // Continue the game or check for termination
        } catch (e) {
            console.log(e)
            return
        }
    }

    // Print the episode results
    console.log(`Episode ${episode + 1}: Fitness = ${score}`)
}

win.show()
global.win = win