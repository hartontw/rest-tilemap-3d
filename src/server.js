import {config} from 'dotenv'
config()

import express from 'express'
import morgan from 'morgan'
import pkg from '../package.json'
import db from './database'

const app = express()

app.use(morgan('dev'))
app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        name: pkg.name,
        description: pkg.description,
        version: pkg.version,
        author: pkg.author
    })
})

import auth from './middlewares/auth'
import login from './controllers/login.controller'
import block from './routes/block.router'
import blocks from './routes/blocks.router'
import path from './controllers/path.controller'

app.post('/login', login)
app.use('/block', auth, block)
app.use('/blocks', auth, blocks)
app.use('/path', auth, path)

async function start() {
    try {
        await db(process.env.CONNECTION_STRING)
        console.log(`💾 Connected to Mongodb: ${pkg.name}`)

        const PORT = process.env.PORT || 3000
        const HOST = process.env.HOST_NAME || 'localhost'

        app.listen(PORT, HOST, () => {
            console.log(`🌐 Listening on ${HOST}:${PORT}`)
        })        
    }
    catch(error) {
        console.error(error)
    }
}

start()