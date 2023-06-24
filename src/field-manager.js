const { QLabel, QPixmap } = require("@nodegui/nodegui")
const path = require('path')

var imageCache = {}

function getImage(imageName, size) {
    if (imageCache[imageName]) {
        return imageCache[imageName]
    }

    var image = new QPixmap()
    const absPath = path.resolve(`${__dirname}/../assets/${imageName}.png`).toString()
    image.load(absPath)
    image = image.scaled(size.width, size.height, 1)

    imageCache[imageName] = image

    return image
}

function GameObj(imageName, objName, pos, size, parent) {
    const label = new QLabel(parent)
    label.setObjectName(objName)
    label.setGeometry(pos.x, pos.y, size.width, size.height)

    label.setPixmap(getImage(imageName, size))

    // label.setInlineStyle(`width:${size.width}px; height:${size.height}px`)

    return label
}

function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function getRandomCoordiante(size) {
    return { x: getRandom(0, size.width), y: getRandom(0, size.height) }
}

function getObstacleImage() {
    switch (getRandom(0, 2)) {
        case 0:
            return 'stone'
        case 1:
            return 'leaf'
        case 2:
            return 'twig'
    }
}

function populateField(parent, worldSize) {
    const ressourceSize = { width: 45, height: 45 }
    const obstacleSize = { width: 50, height: 50 }
    const spiderSize = { width: 35, height: 35 }
    const antSize = { width: 25, height: 25 }

    const ant = GameObj('ant', 'Ant_0', { x: worldSize.width / 2, y: worldSize.height / 2 }, antSize, parent)

    for (let i = 0; i < 50; i++) {
        const randCoordinate = getRandomCoordiante(worldSize)

        let random = getRandom(0, 7)
        if (0 <= random && random <= 2) {
            const obstacle = GameObj(getObstacleImage(), `Obstacle_${i}`, randCoordinate, obstacleSize, parent)
        }
        else if (random == 3) {
            const spider = GameObj('spider', `Spider_${i}`, randCoordinate, spiderSize, parent)
        }
        else if (random == 4) {
            const ressource = GameObj('berries', `Ressource_${i}`, randCoordinate, ressourceSize, parent)
        }
    }
}

// function clearField(parent) {
//     parent.children().forEach(child => {
//         const id = child?.objectName()
//         if (!id.startsWith('floor')) {
//             child.delete()
//         }
//     })
// }

function setupBackground(parent, floorTileDim, worldTileNum) {
    for (let i = 0; i < worldTileNum; i++) {
        for (let j = 0; j < worldTileNum; j++) {
            const label = new QLabel(parent)
            label.setObjectName(`floor_${i}_${j}`)
            label.setGeometry(i * floorTileDim, j * floorTileDim, floorTileDim, floorTileDim)
            label.setPixmap(getImage('floor', { width: floorTileDim, height: floorTileDim }))
        }
    }
}

module.exports = {
    populateField,
    setupBackground,
    // clearField
}