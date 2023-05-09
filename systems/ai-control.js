import Matter from "matter-js"

export default (entities, { touches }) => {
    async function calcSightVector() {
        const ants = Object.entries(entities).filter(entity => entity[0].startsWith('Ant')).map(entry => entry[1])
        const spiders = Object.entries(entities).filter(entity => entity[0].startsWith('Spider')).map(entry => entry[1])
        const ressources = Object.entries(entities).filter(entity => entity[0].startsWith('Ressource')).map(entry => entry[1])

        const obstacles = Object.entries(entities).filter(entity => entity[0].startsWith('Spider')).map(entry => entry[1])

        for (const ant of ants) {
            // console.log(ant)

            const destinations = ressources
                .map(ressource => {
                    const direction = {
                        x: ant.body.position.x - ressource.body.position.x,
                        y: ant.body.position.y - ressource.body.position.y
                    }

                    const distance = Math.sqrt(Math.pow(direction.x, 2) + Math.pow(direction.y, 2))

                    return { distance, dir: direction }
                })

            const destination = destinations.reduce((min, current) => {
                return current.distance < min.distance ? current : min
            }, destinations[0])

            // Matter.Body.setVelocity(ant.body, destination.dir)

            console.log(destination)
        }
    }

    calcSightVector()

    return entities;
}