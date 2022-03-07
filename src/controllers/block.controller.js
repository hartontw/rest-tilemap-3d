import Block from '../models/Block'

function wrongCoords(x, y, z) {
    if (isNaN(x)) return true
    if (isNaN(y)) return true
    if (isNaN(z)) return true
}

function ServerError(res, error) {
    console.error(error)
    return res.status(500).json('Something went wrong')
}

export const post = async (req, res) => {
    try {
        const {x, y, z} = req.body;
        if (wrongCoords(x, y, z)) return res.status(400).json("Coordinates are required")
        if (!req.body.date) return res.status(400).json("Date is required") 
        if (!req.body.info) return res.status(400).json("Info is required")     

        if (await Block.exists({x,y,z})) return res.status(400).json("Already exists")

        const info = req.body.info
        const date = new Date(req.body.date)

        let block = new Block({x, y, z, updated: date, info})
        block = await block.save()
        return res.status(201).json(block)
    }
    catch(error) {
        return ServerError(res, error)
    }
}   

export const get = async (req, res) => {
    try {
        const {x, y, z} = req.query;
        if (wrongCoords(x, y, z)) return res.status(400).json("Coordinates are required")

        const block = await Block.findOne({x, y, z})

        if (!block) return res.status(404).json("Not found")

        return res.status(200).json(block)
    }
    catch(error) {
        return ServerError(res, error)
    }
}

export const put = async (req, res) => {
    try {
        const {x, y, z} = req.body;
        if (wrongCoords(x, y, z)) return res.status(400).json("Coordinates are required")
        if (!req.body.date) return res.status(400).json("Date is required")             
        
        const info = req.body.info
        const date = new Date(req.body.date)

        let block = await Block.findOne({x,y,z})
        if (!block) {
            if (!info) return res.status(304).json(block)
            
            block = new Block({x, y, z, updated: date, info})
            block = await block.save()
            return res.status(201).json(block)
        }

        if (date < block.updated) return res.status(304).json(block)

        if (!info) {
            await Block.deleteOne({x, y, z})
            return res.status(200).json()
        }
            
        block.overwrite({x, y, z, updated: date, info})
        block = await block.save()
        return res.status(200).json(block)
    }
    catch(error) {
        return ServerError(res, error)
    }
}

export const patch = async (req, res) => {
    try {
        const {x, y, z} = req.query;
        if (wrongCoords(x, y, z)) return res.status(400).json("Coordinates are required")
        if (!req.body.date) return res.status(400).json("Date is required") 
        if (!req.body.info) return res.status(400).json("Info is required")     

        let block = await Block.findOne({x,y,z})
        
        if (!block) return res.status(404).json("Not found")

        const info = req.body.info
        const date = new Date(req.body.date)

        block.overwrite({x, y, z, updated: date, info})
        block = await block.save()
        return res.status(200).json(block)
    }
    catch(error) {
        return ServerError(res, error)
    }
}

export const remove = async (req, res) => {
    try {
        const {x, y, z} = req.query;
        if (wrongCoords(x, y, z)) return res.status(400).json("Coordinates are required")

        if (!await Block.exists({x,y,z})) return res.status(404).json("Not found")

        await Block.deleteOne({x, y, z})

        return res.status(200).json()
    }
    catch(error) {
        return ServerError(res, error)
    }
}