import Matter from 'matter-js'
import React from 'react'
import { Image } from 'react'
const leaf = require('../assets/leaf.png')

const Leaf = props => {
    const widthBody = props.body.bounds.max.x - props.body.bounds.min.x
    const heightBody = props.body.bounds.max.y - props.body.bounds.min.y

    const xBody = props.body.position.x - widthBody / 2
    const yBody = props.body.position.y - heightBody / 2

    // const color = props.color;

    return (
        <Image
            source={leaf}
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
    // TODO: Cmd Click on .rectangle to create see the .polygon function
    const initialObstacle = Matter.Bodies.rectangle(
        pos.x,
        pos.y,
        size.width,
        size.height,
        {
            label: 'Rock',
            isStatic: true
        }
    )

    Matter.World.add(world, initialObstacle)

    return {
        body: initialObstacle,
        pos,
        renderer: <Leaf />
    }
}