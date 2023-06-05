import Matter from 'matter-js'
import React from 'react'
import { Image } from 'react-native'

var images = {
    hill1: require('../assets/hill1.png'),
    hill2: require('../assets/hill2.png'),
    hill3: require('../assets/hill3.png'),
    hill4: require('../assets/hill4.png')
}

const Anthill = props => {
    const widthBody = props.body.bounds.max.x - props.body.bounds.min.x
    const heightBody = props.body.bounds.max.y - props.body.bounds.min.y

    const xBody = props.body.position.x - widthBody / 2
    const yBody = props.body.position.y - heightBody / 2

    const level = props.level;

    return (
        <Image
            source={images[`hill${level}`]}
            style={{
                position: 'absolute',
                left: xBody,
                top: yBody,
                width: widthBody,
                height: heightBody
            }} />
    )
}

export default (world, pos, size, level) => {
    const initial = Matter.Bodies.rectangle(
        pos.x,
        pos.y,
        size.width,
        size.height,
        {
            label: 'Hill',
            isSensor: true
        }
    )

    Matter.World.add(world, initial)

    return {
        body: initial,
        level,
        pos,
        renderer: <Anthill />
    }
}

