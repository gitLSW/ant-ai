import Matter from "matter-js"
import { WORLD_SIZE } from "../App"

const MAX_POINTS = 20

function getPointsForType(type) {
    switch (type) {
        case 'Resource':
            return MAX_POINTS;
        case 'Spider':
            return -10;
        default:
            return 0;
    }
}

function isMovable(type) {
    switch (type) {
        case 'Leaf':
        case 'Ant':
        case 'Spider':
            return 1;
        default:
            return 0;
    }
}


// fovObjects: [{ type, dx, dy }]
export default async function aiUpdate(ant, fovObjects) {
    // Normalize collision Vectors: vector / worldSize
    // Encode Types: movable, beneficiary (pos / neg points of Object / maxPointPayoutPossible)
    const aiInputs = fovObjects
        .map(fovObject => {
            fovObject.distance = Math.sqrt(Math.pow(fovObject.dx, 2) + Math.pow(fovObject.dy, 2))
            return fovObject
        })
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 5) // Always the 5 closest Collsions
        .map(obj => {
            return {
                xDir: obj.dx / WORLD_SIZE.width,
                yDir: obj.dy / WORLD_SIZE.height,
                movable: isMovable(obj.type),
                points: getPointsForType(obj.type) / MAX_POINTS
            }
        })

    console.log(aiInputs)
}