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

win.children()
    .forEach(child => {
        console.log(child?.objectName(), child?.pos())
    })

// async function startGame() {
//     // while (true) {

//     //     await sleep(15)
//     // }
// }

// startGame()