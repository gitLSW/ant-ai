const { QMainWindow, QLabel, QPixmap } = require("@nodegui/nodegui")
const path = require('path')
const populateField = require('./populateField')

const floorTileSize = 50
const worldTileNum = 10
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
// const speed = 5
// var dir = 1

// const intervalId = setInterval(gameLoop, 30);

// function gameLoop() {
//     try {
//         win.children().forEach(child => {
//             if (!child) {
//                 return;
//             }

//             const id = child.objectName();
//             const type = id.split('_')[0];
//             const pos = child.pos();

//             if (worldSize.height < pos.y) {
//                 dir = -1;
//             } else if (pos.y < 0) {
//                 dir = 1;
//             }

//             if (type === 'Ant' || type === 'Spider') {
//                 child.move(pos.x, pos.y + dir * speed);
//             }
//         });
//     } catch (e) {
//         console.log(e)
//         clearInterval(intervalId)
//         return
//     }
// }