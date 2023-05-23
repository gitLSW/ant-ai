import Matter from 'matter-js'
import React from 'react'
import { Image } from 'react-native'
const stone = require('../assets/stone.png')
const leaf = require('../assets/leaf.png')

const Obstacle = props => {
    const widthBody = props.body.bounds.max.x - props.body.bounds.min.x
    const heightBody = props.body.bounds.max.y - props.body.bounds.min.y

    const xBody = props.body.position.x - widthBody / 2
    const yBody = props.body.position.y - heightBody / 2

    // const color = props.color;

    // function getRandom(min, max) {
    //     min = Math.ceil(min);
    //     max = Math.floor(max);
    //     return Math.floor(Math.random() * (max - min + 1)) + min;
    // }

    return (
        <Image
            source={stone}
            style={{
                position: 'absolute',
                left: xBody,
                top: yBody,
                width: widthBody,
                height: heightBody
            }} />
    )
}

export default (world, pos, size) => {
    const initialObstacle = Matter.Bodies.rectangle(
        pos.x,
        pos.y,
        size.width,
        size.height,
        {
            label: 'Obstacle',
            isStatic: true
        }
    )

    Matter.World.add(world, initialObstacle)

    return {
        body: initialObstacle,
        color: 'brown',
        pos,
        renderer: <Obstacle />
    }
}

