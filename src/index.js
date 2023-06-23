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

// Game RunLoop
const speed = 5
var dir = 1

function gameLoop() {
    try {
        win.children().forEach(child => {
            if (!child) {
                return;
            }

            const id = child.objectName();
            const type = id.split('_')[0];
            const pos = child.pos();

            if (worldSize.height < pos.y) {
                dir = -1;
            } else if (pos.y < 0) {
                dir = 1;
            }

            if (type === 'Ant' || type === 'Spider') {
                child.move(pos.x, pos.y + dir * speed);
            }
        });
    } catch (e) {
        console.log(e)
    }
}

const intervalId = setInterval(gameLoop, 30);