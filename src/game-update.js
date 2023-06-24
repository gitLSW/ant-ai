module.exports = function evaluateField(gameObjs) {
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
            ants.push({ id, center, rect: geom })
        } else if (type !== 'floor') {
            entities.push({ id, type, center, rect: geom })
        }
    })

    var antsFOVs = []
    for (const ant of ants) {
        for (const entity of entities) {
            const dirV = { dx: entity.center.x - ant.center.x, dy: entity.center.y - ant.center.y }
            const distance = Math.sqrt(Math.pow(dirV.dx, 2) + Math.pow(dirV.dy, 2))

            const updateIndex = antsFOVs.findIndex(pair => pair.ant.id === ant.id)
            const newFOV = [...(antsFOVs[updateIndex]?.fov ?? []), { ...entity, distance, dirV }]
            if (0 <= updateIndex) {
                antsFOVs[updateIndex] = { ant, fov: newFOV }
            } else {
                antsFOVs.push({ ant, fov: newFOV })
            }
        }
    }

    var collisions = []
    for (let i = 0; i < antsFOVs.length; i++) {
        antsFOVs[i].fov = antsFOVs[i].fov.sort((a, b) => a.distance - b.distance)

        for (const entity of antsFOVs[i].fov) {
            if (isIntersecting(antsFOVs[i].ant.rect, entity.rect)) {
                collisions.push({ a: antsFOVs[i].ant, b: entity})
            }
        }
    }
    
    return { antsFOVs, collisions }
}


function isIntersecting(rectA, rectB) {
    // Check if rectA and rectB intersect
    if (
        rectA.left() + rectA.width() > rectB.left() &&
        rectB.left() + rectB.width() > rectA.left() &&
        rectA.top() + rectA.height() > rectB.top() &&
        rectB.top() + rectB.height() > rectA.top()
    ) {
        return true;
    }

    return false;
}