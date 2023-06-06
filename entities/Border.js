import Matter from 'matter-js'
import React from 'react'
import { View } from 'react-native'

const Border = props => {
    const widthBody = props.body.bounds.max.x - props.body.bounds.min.x
    const heightBody = props.body.bounds.max.y - props.body.bounds.min.y

    const xBody = props.body.position.x - widthBody / 2
    const yBody = props.body.position.y - heightBody / 2

    // const color = props.color;

    function getRandom(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // PATH THAT CREATES A RANDOM POLYGON WITH A SINGLE LARGE HOLE IN THE MIDDLE:
    // e.g. Random Point Generation in 40px rectangle
    var polygonPoints = [{ x: 0, y: 0 }]
    for (let index = 1; index <= 10; index++) {
        polygonPoints.push({
            x: getRandom(0, widthBody * 0.15),
            y: getRandom(0, (heightBody * index) / 10)
        })
    }

    polygonPoints.push({ x: widthBody, y: 0 })
    for (let index = 1; index <= 10; index++) {
    }

    polygonPoints.push({ x: 0, y: heightBody })
    for (let index = 1; index <= 10; index++) {
    }

    polygonPoints.push({ x: widthBody, y: heightBody })
    for (let index = 1; index <= 10; index++) {
    }

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
    const initial = Matter.Bodies.rectangle(
        pos.x,
        pos.y,
        size.width,
        size.height,
        {
            label: 'Border',
            isStatic: true
        }
    )

    Matter.World.add(world, initial)

    return {
        body: initial,
        pos,
        renderer: <Border />
    }
}

