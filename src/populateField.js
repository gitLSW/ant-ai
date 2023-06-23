const { QLabel, QPixmap, QWidget } = require("@nodegui/nodegui")
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

function populateField(win, worldSize) {
    const ressourceSize = { width: 30, height: 30 }
    const obstacleSize = { width: 35, height: 35 }
    const spiderSize = { width: 25, height: 25 }
    const antSize = { width: 15, height: 15 }

    const ant = GameObj('ant', 'Ant_0', { x: worldSize.width / 2, y: worldSize.height / 2 }, antSize, win)

    for (let i = 0; i < 20; i++) {
        const randCoordinate = getRandomCoordiante(worldSize)

        let random = getRandom(0, 4)
        if (0 <= random && random <= 2) {
            const obstacle = new GameObj(getObstacleImage(), `Obstacle_${i}`, randCoordinate, obstacleSize, win)
        }
        else if (random == 3) {
            const spider = new GameObj('spider', `Spider_${i}`, randCoordinate, spiderSize, win)
        }
        else if (random == 4) {
            const ressource = new GameObj('berries', `Ressource_${i}`, randCoordinate, ressourceSize, win)
        }
    }
}

module.exports = populateField