export const InterpolateBetweenPoints = (a, b, speed) => {
    const vector = {x: (b.x - a.x), y: (b.y - a.y)}
    const distance = Math.sqrt(vector.x * vector.x + vector.y * vector.y)
    const interpolated = {x: a.x + ((vector.x / distance) * speed), y: a.y + ((vector.y / distance) * speed)};
    return interpolated
}

export const DistanceBetween = (a, b) => {
    const vector = {x: (b.x - a.x), y: (b.y - a.y)}
    const distance = Math.sqrt((vector.x * vector.x) + (vector.y * vector.y))
    
    return distance
}