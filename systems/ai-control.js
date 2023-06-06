import Matter from "matter-js"
import { InterpolateBetweenPoints } from "../utils/movement";
import { DistanceBetween } from "../utils/movement";

class Tile {
    constructor(pos, passable) {
        this.pos = pos

        this.passable = passable;
        this.gCost = 0;
        this.hCost = 0;
        this.Parent = null;
    }

    fCost() {
        return this.gCost + this.hCost;
    }
}

const toleranceDistance = 10
class Entity {
    constructor(current_pos) {
        this.destination = null
        this.path = null
        this.speed = 5
        this.current_pos = current_pos
        this.pos = 0
    }

    Update() {
        if (DistanceBetween(this.current_pos, this.destination) > toleranceDistance && this.pos < this.path.length) {
            if (DistanceBetween(this.current_pos, this.path[this.pos]) > toleranceDistance) {
                this.current_pos = InterpolateBetweenPoints(this.current_pos, this.path[this.pos], this.speed)
            }
            else {
                this.pos++;
            }
        }
    }

    setPath(dest, path) {
        this.path = path;
        this.destination = dest
        this.pos = 0
    }
}

class NavManager {
    constructor(tiles) {
        this.tiles = tiles;

        this.xExtend = 1000
        this.yExtend = 1000
    }

    getPath(a, b) {
        this.FindPath(a, b);
        let path = this.RetracePath(this.getTileAtPosition(a), this.getTileAtPosition(b))
        this.cleanUp
        return path
    }

    cleanUp() {
        for (let i = 0; i < this.tiles.length; i++) {
            for (let j = 0; j < this.tiles[0].length; j++) {


                this.tiles[i][j].parent = null;
                this.tiles[i][j].hCost = 0;
                this.tiles[i][j].gCost = 0;
            }
        }
    }

    getTileAtPosition(pos) {
        let smallestDistance = 10000
        let bestMatch = this.tiles[0][0]
        for (let i = 0; i < this.tiles.length; i++) {
            for (let j = 0; j < this.tiles[0].length; j++) {
                if (DistanceBetween(pos, this.tiles[i][j].pos) < smallestDistance) {
                    smallestDistance = DistanceBetween(pos, this.tiles[i][j].pos)

                    bestMatch = this.tiles[i][j]
                }
            }
        }
        return bestMatch
    }

    getNeighbourTiles(currentNode) {
        let ns = []
        ns.push(this.getTileAtPosition({ x: currentNode.pos.x + 50, y: currentNode.pos.y }))
        ns.push(this.getTileAtPosition({ x: currentNode.pos.x - 50, y: currentNode.pos.y }))
        ns.push(this.getTileAtPosition({ x: currentNode.pos.x, y: currentNode.pos.y + 50 }))
        ns.push(this.getTileAtPosition({ x: currentNode.pos.x, y: currentNode.pos.y - 50 }))

        ns.push(this.getTileAtPosition({ x: currentNode.pos.x + 50, y: currentNode.pos.y + 50 }))
        ns.push(this.getTileAtPosition({ x: currentNode.pos.x - 50, y: currentNode.pos.y + 50 }))
        ns.push(this.getTileAtPosition({ x: currentNode.pos.x - 50, y: currentNode.pos.y - 50 }))
        ns.push(this.getTileAtPosition({ x: currentNode.pos.x + 50, y: currentNode.pos.y - 50 }))

        for (let i = 0; i < ns.length; i++) {
            if (!ns[i].passable) {
                ns.slice(i)
            }
        }

        return ns
    }

    RetracePath(startNode, targetNode) {
        let path = []
        let currentNode = targetNode;

        while (currentNode != startNode) {
            path.push(currentNode);
            currentNode = currentNode.Parent;
        }

        path.reverse()
        let output = []

        path.forEach(g => output.push(g.pos))
        return output;
    }

    FindPath(startPosition, endPosition) {
        let startNode = this.getTileAtPosition(startPosition);
        let targetNode = this.getTileAtPosition(endPosition);

        let openSet = []
        let closedSet = []
        openSet.push(startNode)

        while (openSet.length > 0) {
            let currentNode = openSet[0];
            for (let i = 1; i < openSet.Count; i++) {
                if (openSet[i].fCost() < currentNode.fCost() || openSet[i].fCost() == currentNode.fCost() && openSet[i].hCost < currentNode.hCost) {
                    currentNode = openSet[i]
                }
            }

            const index = openSet.indexOf(currentNode);
            openSet.splice(index, 1);
            closedSet.push(currentNode);

            if (currentNode == targetNode) {
                return this.RetracePath(startNode, targetNode);
            }

            let ns = this.getNeighbourTiles(currentNode);
            ns.forEach(g => {
                if (!(!g.passable || closedSet.includes(g))) {
                    let newMovementCostToNeighbour = currentNode.gCost + 1;
                    if (newMovementCostToNeighbour < g.gCost || !openSet.includes(g)) {
                        g.gCost = newMovementCostToNeighbour;
                        g.hCost = DistanceBetween(g.pos, targetNode.pos)
                        g.Parent = currentNode;

                        if (!openSet.includes(g))
                            openSet.push(g);
                    }
                }
            });
        }

        return [];
    }
}


let navManager = null
let firstTime = false
let entity = null

export default (entities) => {
    // if (!firstTime) {
    //     let tiles = []
    //     let pos = 0

    //     for (let i = 0; i < 20; i++) {
    //         tiles.push([])

    //         for (let j = 0; j < 20; j++) {
    //             let tile = null
    //             let name = ((i * 50) + 25) + "_" + ((j * 50) + 25)
    //             //cObject.entries(entities).filter(entity => entity[0].startsWith('Spider')).map(entry => entry[1])
    //             if (Object.entries(entities).find(e => e[0].startsWith("ImpNavTile" + name)) != undefined) {
    //                 tile = new Tile({ x: (i * 50) + 25, y: (j * 50) + 25 }, false)
    //             }
    //             else {
    //                 tile = new Tile({ x: (i * 50) + 25, y: (j * 50) + 25 }, true)
    //             }
    //             tiles[pos].push(tile)
    //         }
    //         pos++
    //     }

    //     firstTime = true
    //     navManager = new NavManager(tiles)

    //     let current_pos = { x: entities["Ant1"].body.position.x, y: entities["Ant1"].body.position.y };
    //     let target_pos = { x: 0, y: 0 }

    //     entity = new Entity(current_pos)
    //     navManager.cleanUp();
    //     let path = navManager.FindPath(current_pos, target_pos)
    //     entity.setPath(target_pos, path)
    // }

    // entity.Update()

    // entities["Ant1"].body.position.x = entity.current_pos.x
    // entities["Ant1"].body.position.y = entity.current_pos.y
    





    
    // async function calcSightVector() {
    //     const ants = Object.entries(entities).filter(entity => entity[0].startsWith('Ant')).map(entry => entry[1])
    //     const spiders = Object.entries(entities).filter(entity => entity[0].startsWith('Spider')).map(entry => entry[1])
    //     const ressources = Object.entries(entities).filter(entity => entity[0].startsWith('Ressource')).map(entry => entry[1])

    //     const obstacles = Object.entries(entities).filter(entity => entity[0].startsWith('Spider')).map(entry => entry[1])

    //     for (const ant of ants) {
    //         // console.log(ant)

    //         const destinations = ressources
    //             .map(ressource => {
    //                 const direction = {
    //                     x: ant.body.position.x - ressource.body.position.x,
    //                     y: ant.body.position.y - ressource.body.position.y
    //                 }

    //                 const distance = Math.sqrt(Math.pow(direction.x, 2) + Math.pow(direction.y, 2))

    //                 return { distance, dir: direction }
    //             })

    //         const destination = destinations.reduce((min, current) => {
    //             return current.distance < min.distance ? current : min
    //         }, destinations[0])

    //         // Matter.Body.setVelocity(ant.body, destination.dir)

    //         //console.log(destination)
    //     }
    // }

    // calcSightVector()

    return entities;
}