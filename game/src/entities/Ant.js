import Matter from 'matter-js'
import React from 'react'
import { Image } from 'react'
const ant = require('../assets/ant.png')

const Ant = props => {
    const widthBody = props.body.bounds.max.x - props.body.bounds.min.x
    const heightBody = props.body.bounds.max.y - props.body.bounds.min.y

    const xBody = props.body.position.x - widthBody / 2
    const yBody = props.body.position.y - heightBody / 2

    return (
        <Image
            source={ant}
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
    const initialAnt = Matter.Bodies.rectangle(
        pos.x,
        pos.y,
        size.width,
        size.height,
        { label: 'Ant' }
    )

    Matter.World.add(world, initialAnt)

    return {
        body: initialAnt,
        health: 10,
        pos,
        renderer: <Ant />
    }
}

