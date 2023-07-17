import Matter from 'matter-js'
import React from 'react'
import { Image } from 'react'
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
    const initial = Matter.Bodies.rectangle(
        pos.x,
        pos.y,
        size.width,
        size.height,
        {
            label: 'NavTile',
            isSensor: true
        }
    )

    // turns off collisions
    initial.collisionFilter = {
        'group': -1,
        'category': 2,
        'mask': 0,
    };

    Matter.World.add(world, initial)

    return {
        body: initial,
        pos,
        renderer: <NavTile />
    }
}

