import Block from '../models/Block'
import Vector from '../lib/Vector'

function exists(blocks, block) {
    return blocks[block.x] && blocks[block.x][block.y] && blocks[block.x][block.y][block.z]
}

function addToNodes(nodes, node) {
    if (!nodes[node.x]) {
        nodes[node.x] = {}
    }
    if (!nodes[node.x][node.y]) {
        nodes[node.x][node.y] = {}
    }
    nodes[node.x][node.y][node.z] = node
}

function createNode(parent, position, destination) {
    let node = {}
    node.x = position.x
    node.y = position.y
    node.z = position.z
    node.position = () => new Vector(node.x, node.y, node.z)
    node.parent = parent
    node.g = parent ? parent.g + 1 : 0
    node.h = Vector.Distance(destination, node.position())
    node.f = () => node.g + node.h
    node.open = true
    return node
}

function getLower(openList) {
    let l = openList.length-1
    let lower = openList[l]

    for (let i = openList.length-2; i >= 0; i--) {
        const node = openList[i]
        const nf = node.f()
        const lf = lower.f()
        if (nf < lf || nf == lf && node.h < lower.h) {
            lower = node
            l = i
        }
    }

    if (lower) {
        lower.open = false
        openList.splice(l, 1)
    }

    return lower
}

function available(nodes, position) {
    return (!nodes[position.x] || !nodes[position.x][position.y] || !nodes[position.x][position.y][position.z])
}

function generateAdjacent(blocks, destination, nodes, openList, parent) {
    const check = function(x, y, z) {
        let position = new Vector(x, y, z)
        if (!exists(blocks, position)) {
            if (available(nodes, position)) {
                let node = createNode(parent, position, destination)
                addToNodes(nodes, node)
                openList.push(node)
            }
            else if (nodes[x][y][z].open && nodes[x][y][z].g > parent.g + 1) {
                nodes[x][y][z].g = parent.g + 1
                nodes[x][y][z].parent = parent
            }
        }
    }
    check(parent.x-1, parent.y, parent.z)
    check(parent.x+1, parent.y, parent.z)
    check(parent.x, parent.y-1, parent.z)
    check(parent.x, parent.y+1, parent.z)
    check(parent.x, parent.y, parent.z-1)
    check(parent.x, parent.y, parent.z+1)
}

function buildPath(parent) {
    const reversePath = []
    while (parent) {
        reversePath.push(parent.position())
        parent = parent.parent
    }
    return reversePath.reverse()
}

function ServerError(res, error) {
    console.error(error)
    return res.status(500).json('Something went wrong')
}

function parse(value) {
    try {
        return {
            content: JSON.parse(value)
        }
    }
    catch(e){
        return {
            error:true,
            message:e.message
        }
    }
}

function check(value) {    
    const parsed = parse(value)
    if (parsed.error) {
        let decoded = decodeURIComponent(value)
        if (decoded !== value) {
            return parse(decoded)
        }
    }
    return parsed
}

export default async (req, res) => {
    let {filter, start, destination, space} = req.body

    if (Object.keys(req.body).length === 0) {
        let c

        if (!req.query.start) return res.status(400).json("Start position is required")
        c = check(req.query.start)
        if (c.error) return res.status(400).json(`start: ${c.message}`)
        start = c.content

        if (!req.query.start) return res.status(400).json("Destination position is required")
        c = check(req.query.destination)
        if (c.error) return res.status(400).json(`destination: ${c.message}`)
        destination = c.content

        if (req.query.filter) {
            c = check(req.query.filter)
            if (c.error) return res.status(400).json(`filter: ${c.message}`)
            filter = c.content
        }

        if (req.query.space) {
            c = check(req.query.space)
            if (c.error) return res.status(400).json(`space: ${c.message}`)
            space = c.content
        }
    }    

    if (!filter) filter = {}
    if (!space) space = 0

    try {
        start = new Vector(start.x, start.y, start.z)
        destination = new Vector(destination.x, destination.y, destination.z)            

        if (Vector.Equals(start, destination)) return res.status(400).json({error: "Start and Destination are the same position"})

        if (typeof(space) === "number") {
            space = new Vector(space, space, space)
        }

        filter.x = { $gte : Math.min(start.x, destination.x) - space.x, $lte : Math.max(start.x, destination.x) + space.x}
        filter.y = { $gte : Math.min(start.y, destination.y) - space.y, $lte : Math.max(start.y, destination.y) + space.y}
        filter.z = { $gte : Math.min(start.z, destination.z) - space.z, $lte : Math.max(start.z, destination.z) + space.z}

        const stored = await Block.find(filter).select(["-_id", "x", "y", "z"])

        const blocks = {}
        stored.forEach(block => {
            const {x, y, z} = block
            if (!blocks[x]) blocks[x] = {}
            if (!blocks[x][y]) blocks[x][y] = {}
            blocks[x][y][z] = true
        });

        let parent = createNode(null, start, destination)
        let nodes = {}, openList = []
    
        addToNodes(nodes, parent)
        parent.open = false
    
        while (!Vector.Equals(parent.position(), destination)) {
            generateAdjacent(blocks, destination, nodes, openList, parent)
    
            const nextParent = getLower(openList)
            if (!nextParent) {
                return res.status(404).json({error: "Invalid path", path: orderPath(parent)})
            }
            parent = nextParent
        }

        const path = buildPath(parent)

        return res.status(200).json(path)
    }
    catch(error) {
        return ServerError(res, error)
    }
}