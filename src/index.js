const { QMainWindow, QWidget, FlexLayout } = require("@nodegui/nodegui")
const populateField = require('./populateField')
// const logo = require('../assets/ant.png')

const worldSize = { width: 500, height: 500 }

const win = new QMainWindow()
win.setFixedSize(worldSize.width, worldSize.height)

// Set Background

populateField(win, worldSize)

win.show()
global.win = win

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// const ant = win.childAt(worldSize.width / 2, worldSize.height / 2)
// console.log(ant)
// console.log(ant.objectName())

async function startGame() {
    while (true) {
        win.children()
            .forEach(child => {
                if (!child) {
                    return
                }

                const id = child.objectName()
                const type = id.split('_')[0]
                const pos = child.pos()

                if (type === 'Ant') {
                    child.move(pos.x, pos.y + 5)
                } else if (type === 'Spider') {
                    child.move(pos.x + 5, pos.y)
                }
            })

        await sleep(15)
    }
}

startGame()