import Matter from 'matter-js'
import React from 'react'
import { View } from 'react-native'

const Border = props => {
    const widthBody = props.body.bounds.max.x - props.body.bounds.min.x
    const heightBody = props.body.bounds.max.y - props.body.bounds.min.y

    const xBody = props.body.position.x - widthBody / 2
    const yBody = props.body.position.y - heightBody / 2

    return (
        <View
            
        style={{
            background: 'grey',
            position: 'absolute',
            left: xBody,
            top: yBody,
            width: widthBody,
            height: heightBody
        }} />
    )
}

export default (world, pos, size) => {
    const inital = Matter.Bodies.rectangle(
        pos.x,
        pos.y,
        size.width,
        size.height,
        {
            label: `Border`,
            isStatic: true
        }
    )

    Matter.World.add(world, inital)

    return {
        body: inital,
        pos,
        renderer: <Border />
    }
}

