import Matter from 'matter-js'
import React from 'react'
import { Image } from 'react-native'
const berries = require('../assets/berries.png')

const Ressource = props => {
    const widthBody = props.body.bounds.max.x - props.body.bounds.min.x
    const heightBody = props.body.bounds.max.y - props.body.bounds.min.y

    const xBody = props.body.position.x - widthBody / 2
    const yBody = props.body.position.y - heightBody / 2

    // const color = props.color;

    return (
        <Image
            source={berries}
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
    const initialRessource = Matter.Bodies.rectangle(
        pos.x,
        pos.y,
        size.width,
        size.height,
        {
            label: 'Ressource',
            isStatic: true
        }
    )

    Matter.World.add(world, initialRessource)

    return {
        body: initialRessource,
        pos,
        renderer: <Ressource />
    }
}

