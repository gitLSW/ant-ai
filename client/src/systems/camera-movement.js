const cameraMovementSpeed = 10

export default (entities, { touches, events }) => {
    if (events?.length) {
        
        events
            .filter(event => event.type === 'keypress')
            .forEach(event => {
                switch (event.key) {
                    case 'w':
                        entities.Camera.position.y += cameraMovementSpeed
                        break
                    case 'a':
                        entities.Camera.position.x += cameraMovementSpeed
                        break
                    case 's':
                        entities.Camera.position.y -= cameraMovementSpeed
                        break
                    case 'd':
                        entities.Camera.position.x -= cameraMovementSpeed
                        break
                    default:
                        break
                }
            })
    }

    touches.filter(t => t.type === "move").forEach(t => {
        entities.Camera.position.x += t.delta.pageX
        entities.Camera.position.y += t.delta.pageY
    })

    return entities;
}