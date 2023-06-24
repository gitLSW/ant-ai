module.exports = function getAntVisibles(gameObjs) {
    var ants = []
    var entities = []

    gameObjs.forEach(child => {
        if (!child) {
            return;
        }

        const id = child.objectName();
        const type = id.split('_')[0];
        const geom = child.geometry();
        const center = {
            x: geom.left() + geom.width() / 2,
            y: geom.top() + geom.height() / 2
        }

        if (type === 'Ant') {
            ants.push({ id, center })
        } else if (type !== 'floor') {
            entities.push({ id, type, center })
        }
    })

    var antsVisibleObjects = {}
    for (const ant of ants) {
        for (const entity of entities) {
            const dirV = { dx: entity.center.x - ant.center.x, dy: entity.center.y - ant.center.y }
            const distance = Math.sqrt(Math.pow(dirV.dx, 2) + Math.pow(dirV.dy, 2))

            antsVisibleObjects[ant.id] = [...(antsVisibleObjects[ant.id] ?? []), { ...entity, distance, dirV }]
        }
    }

    return antsVisibleObjects
}