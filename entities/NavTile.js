import Matter from 'matter-js'
import React from 'react'
import { Image } from 'react-native'
const tile = require('../assets/floor.png')

const NavTile = props => {
    const widthBody = props.body.bounds.max.x - props.body.bounds.min.x
    const heightBody = props.body.bounds.max.y - props.body.bounds.min.y

    const xBody = props.body.position.x - widthBody / 2
    const yBody = props.body.position.y - heightBody / 2

    // const color = props.color;

    return (
        <Image
            source={tile}
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
            label: 'NavTile',
            isStatic: true
        }
    )

    Matter.World.add(world, initialObstacle)

    return {
        body: initialObstacle,
        color: 'black',
        pos,
        renderer: <NavTile />
    }
}

