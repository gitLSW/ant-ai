import Matter from 'matter-js'
import React from 'react'
import { Image } from 'react-native'
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

export default (world, pos, size, index) => {
    const antBody = Matter.Bodies.rectangle(
        pos.x,
        pos.y,
        size.width,
        size.height,
        { label: `AntBody_${index}` }
    )

    const antSensor = Matter.Bodies.circle(pos.x, pos.y, size.width * 10, { label: `AntSensor_${index}`, isSensor: true })
    antSensor.render.opacity = 0.2;
    antSensor.area = 0;
    Matter.Body.setDensity(antSensor, 0)

    const initialAnt = Matter.Body.create({ parts: [antBody, antSensor], label: `Ant_${index}` });

    Matter.World.add(world, initialAnt)

    return {
        body: initialAnt,
        health: 10,
        pos,
        renderer: <Ant />
    }
}