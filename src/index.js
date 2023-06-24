const { QMainWindow, QLabel, QPixmap } = require("@nodegui/nodegui")
const path = require('path')
const populateField = require('./populateField')

const floorTileSize = 120
const worldTileNum = 6
const worldSize = { width: floorTileSize * worldTileNum, height: floorTileSize * worldTileNum }

const win = new QMainWindow()
win.setFixedSize(worldSize.width, worldSize.height)

// Set Background
var floorImg = new QPixmap()
const absPath = path.resolve(`${__dirname}/../assets/floor.png`).toString()
floorImg.load(absPath)
floorImg = floorImg.scaled(floorTileSize, floorTileSize)

for (let i = 0; i < worldTileNum; i++) {
    for (let j = 0; j < worldTileNum; j++) {
        const label = new QLabel(win)
        label.setObjectName(`floor_${i}_${j}`)
        label.setGeometry(i * floorTileSize, j * floorTileSize, floorTileSize, floorTileSize)
        label.setPixmap(floorImg)
    }
}

populateField(win, worldSize)

win.show()
global.win = win

// Game RunLoop
const speed = 5
var dir = 1


const MAX_POINTS = 20
function getPointsForType(type) {
    switch (type) {
        case 'Resource':
            return MAX_POINTS;
        case 'Spider':
            return -10;
        default:
            return 0;
    }
}

const intervalId = setInterval(gameLoop, 30);
function gameLoop() {
    try {
        var ants = []
        var entities = []

        win.children().forEach(child => {
            if (!child) {
                return;
            }

            const id = child.objectName();
            const type = id.split('_')[0];
            const geom = child.geometry();
            const center = {
                x: geom.left() + geom.width() / 2,
                y: geom.top() + geom.height() / 2
            }

            if (type === 'Ant') {
                ants.push({ id, center })
            } else if (type !== 'floor') {
                entities.push({ id, type, center })
            }
        })

        var antsVisibleObjects = {}
        for (const ant of ants) {
            for (const entity of entities) {
                const dirV = { dx: entity.center.x - ant.center.x, dy: entity.center.y - ant.center.y }
                const distance = Math.sqrt(Math.pow(dirV.dx, 2) + Math.pow(dirV.dy, 2))

                antsVisibleObjects[ant.id] = [...(antsVisibleObjects[ant.id] ?? []), { ...entity, distance, dirV }]
            }
        }

        const input = Object.entries(antsVisibleObjects)
            .map(entry => {
                const entities = entry[1]
                    .sort((a, b) => a.distance - b.distance)
                    .slice(0, 5) // Always the 5 closest Collsions
                    .map(entity => {
                        return {
                            // Normalize direction Vectors: vector / worldSize
                            xDir: entity.dirV.dx / worldSize.width,
                            yDir: entity.dirV.dy / worldSize.height,
                            points: getPointsForType(entity.type) / MAX_POINTS
                        }
                    })

                return { antID: entry[0], entities }
            })


        console.log(input.map(e => e.entities))
    } catch (e) {
        console.log(e)
        clearInterval(intervalId)
        return
    }
}