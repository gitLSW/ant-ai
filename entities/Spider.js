import Matter from 'matter-js'
import React from 'react'
import { Image } from 'react-native'
const spider = require('../assets/spider.png')

const Spider = props => {
    const widthBody = props.body.bounds.max.x - props.body.bounds.min.x
    const heightBody = props.body.bounds.max.y - props.body.bounds.min.y

    const xBody = props.body.position.x - widthBody / 2
    const yBody = props.body.position.y - heightBody / 2

    // const color = props.color;

    return (
        <Image
            source={spider}
            style={{
                position: 'absolute',
                left: xBody,
                top: yBody,
                width: widthBody,
                height: heightBody
            }} />
    )
}

export default (world, pos, size, index) => {
    const inital = Matter.Bodies.rectangle(
        pos.x,
        pos.y,
        size.width,
        size.height,
        { label: `Spider_${index}` }
    )

    Matter.World.add(world, inital)

    return {
        body: inital,
        health: 30,
        pos,
        renderer: <Spider />
    }
}

