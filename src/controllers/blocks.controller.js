import Block from '../models/Block'

function ServerError(res, error) {
    console.error(error)
    return res.status(500).json('Something went wrong')
}

function checkBlock(block) {
    if (isNaN(block.x)) return false
    if (isNaN(block.y)) return false
    if (isNaN(block.z)) return false
    block.date = new Date(block.date)
    if (!block.date instanceof Date || isNaN(block.date.valueOf())) return false
    return true
}

async function newBlock(block) {
    try {
        const newBlock = new Block({x:block.x,y:block.y,z:block.z,updated:block.date,info:block.info})
        return await newBlock.save()
    }
    catch(error) {}
}

async function updateOne(stored, block)
{
    try {
        stored.overwrite({x:block.x,y:block.y,z:block.z,updated:block.date,info:block.info})
        return await stored.save()
    }
    catch(error) {}
}

async function deleteOne(filter) {
    try {
        await Block.deleteOne(filter)
        return true
    }
    catch(error) {
        return false
    }
}

export const post = async (req, res) => {    
    try {
        if (!(req.body instanceof Array)) return res.status(400).json("Body is not an array of blocks")

        const response = {
            failed: [],            
            inserted: [],
            updated: [],
            expired: [],
            deleted: []
        }

        const blocks = req.body.sort( (a, b) => b.date - a.date )

        for (const block of blocks) {
            if (checkBlock(block)) {
                const stored = await Block.findOne({x:block.x, y:block.y, z:block.z})
                if (stored) {
                    if (block.date > stored.updated) {
                        if (block.info) {
                            if (await updateOne(stored, block)) response.updated.push(block)
                            else response.failed.push(block)
                        }
                        else {
                            if (await deleteOne(block)) response.deleted.push(block)
                            else response.failed.push(block)
                        }
                    }
                    else response.expired.push(block)
                }
                else if (block.info) {
                    if (await newBlock(block)) response.inserted.push(block)
                    else response.failed.push(block)
                }
                else response.expired.push(block)
            }
            else response.failed.push(block)
        }

        return res.status(200).json(response)
    }
    catch(error) {
        return ServerError(res, error)
    }
}

export const get = async (req, res) => {
    let filter = {} // Object
    let sort = {} // Object
    let select = [] // Array
    let limit = 0 // Number

    let header;
    try {
        if (req.query.filter) {
            header = "filter"
            filter = JSON.parse(req.query.filter)
        }
        if (req.query.sort) {
            header = "sort"
            sort = JSON.parse(req.query.sort)
        }
        if (req.query.select) {
            header = "select"
            select = JSON.parse(req.query.select)
        }
        if (req.query.limit) {            
            limit = req.query.limit
        }
    }
    catch(error) {
        return res.status(400).json(`${header}: ${error.message}`)
    }

    try {
        const blocks = await Block.find(filter).sort(sort).select(select).limit(limit)
        return res.status(200).json(blocks)
    }
    catch(error) {
        return ServerError(res, error)
    }
}

export const remove = async (req, res) => {
    let filter = {} // Object

    try {
        if (req.query.filter) {
            filter = JSON.parse(req.query.filter)
        }
    }
    catch(error) {
        return res.status(400).json(`${error.message}`)
    }

    try {
        await Block.deleteMany(filter)
        return res.status(200).json()
    }
    catch(error) {
        return ServerError(res, error)
    }
}