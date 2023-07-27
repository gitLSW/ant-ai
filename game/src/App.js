import React, { useState, useEffect } from 'react'
import { GameEngine } from 'react-game-engine'
import entities from './entities'
import CameraMovement from './systems/camera-movement'
import AiControl from './systems/ai-control'
import Game from './systems/game'
import CameraRenderer from './camera-renderer'
import useKeyPress from './systems/key-press-register'
const background = require('./assets/floor.png')

export default function App() {
  // const [running, setRunning] = useState(false)
  const [gameEngine, setGameEngine] = useState(null)
  const [currentPoints, setCurrentPoints] = useState(0)

  useKeyPress(['w', 'a', 's', 'd'], event => {
    if (gameEngine) {
      gameEngine.dispatch({ type: 'keypress', key: event.key })
    }
  })


  // Only runs once on Load
  useEffect(() => {
    // setRunning(false)
  }, [])

  return (
    <GameEngine
      ref={ref => { setGameEngine(ref) }}
      systems={[CameraMovement, AiControl, Game]}
      renderer={CameraRenderer}
      entities={entities()}
      running={running}
      onEvent={e => {
        // console.log(e.points)

        switch (e.type) {
          case 'game_over':
            // setRunning(false)
            gameEngine.stop()
            break;
          case 'points':
            setCurrentPoints(currentPoints + e.points)
            break;
          default:
            break;
        }
      }}
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
    >
    </GameEngine>
  );
}
