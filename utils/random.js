import { Dimensions } from 'react-native'

export const getRandom = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

export const getRandomCoordiante = (size) => {
    return { x: getRandom(0, size.width), y: getRandom(0, size.height) }
}

// export const getPipeSizePosPair = (addToPosX = 0) => {
//     let yPosTop = -getRandom(300, windowHeight - 100)

//     const pipeTop = { pos: { x: windowWidth + addToPosX, y: yPosTop }, size: { height: windowHeight * 2, width: 75 } }
//     const pipeBottom = { pos: { x: windowWidth + addToPosX, y: windowHeight * 2 + 200 + yPosTop }, size: { height: windowHeight * 2, width: 75 } }

//     return { pipeTop, pipeBottom }
// }