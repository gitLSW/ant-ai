const { QWidget } = require("@nodegui/nodegui")

function populateField(win, worldSize) {
    const ressourceSize = { width: 7, height: 7 }
    const obstacleSize = { width: 15, height: 15 }
    const spiderSize = { width: 10, height: 10 }
    const antSize = { width: 5, height: 5 }

    const ant = new QWidget(win)
    ant.setObjectName('Ant_0')
    ant.setGeometry(worldSize.width / 2, worldSize.height / 2, antSize.width, antSize.height)
    ant.setInlineStyle("background-color: blue;")

    function getRandom(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min)
    }

    function getRandomCoordiante(size) {
        return { x: getRandom(0, size.width), y: getRandom(0, size.height) }
    }

    for (let i = 0; i < 20; i++) {
        const gameObj = new QWidget(win)
        const randCoordinate = getRandomCoordiante(worldSize)

        let random = getRandom(0, 4)
        if (0 <= random && random <= 2) {
            gameObj.setObjectName('Obstacle_' + i)
            gameObj.setGeometry(randCoordinate.x, randCoordinate.y, obstacleSize.width, obstacleSize.height)
            gameObj.setInlineStyle("background-color: grey;")
        }
        else if (random == 3) {
            gameObj.setObjectName('Spider_' + i)
            gameObj.setGeometry(randCoordinate.x, randCoordinate.y, spiderSize.width, spiderSize.height)
            gameObj.setInlineStyle("background-color: red;")
        }
        else if (random == 4) {
            gameObj.setObjectName('Ressource_' + i)
            gameObj.setGeometry(randCoordinate.x, randCoordinate.y, ressourceSize.width, ressourceSize.height)
            gameObj.setInlineStyle("background-color: yellow;")
        }
    }
}

module.exports = populateField