export default CameraMovement = (entities, { touches }) => {
    
    touches.filter(t => t.type === "move").forEach(t => {
        entities.Camera.position.x += t.delta.pageX
        entities.Camera.position.y += t.delta.pageY
    })

    return entities;
}