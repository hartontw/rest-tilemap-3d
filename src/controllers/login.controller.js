import jwt from 'jsonwebtoken'
import rc4 from '../lib/RC4'

const maxAttempts = 3
const maxRemotes = 100
const timePenalty = 300000
const remotes = {}

function isBlocked(remote) {
    return remotes[remote] 
        && remotes[remote].count >= maxAttempts 
        && new Date() - remotes[remote].date < timePenalty
}

function underAttack() {
    return Object.keys(remotes).length > maxRemotes
}

function addAttempt(remote) {
    if (!remotes[remote]) {
        remotes[remote] = {count: 0}
    }
    remotes[remote].count++
    remotes[remote].date = new Date()
}

function deleteRemote(remote) {
    if (remotes[remote]) {
        delete remotes[remote]
    }
}

export default async (req, res) => {
    try {    
        if (!process.env.PASSWORD) return res.status(200).json({auth:true})

        if (!req.body.password) return res.status(400).json({auth:false, message:"Password required"})

        if (underAttack()) return res.status(503).json({auth:false, message:"Under attack"})

        const remote = req.connection.remoteAddress.toString()        
            
        if (isBlocked(remote)) return res.status(403).json({auth:false, message:"Blocked"})

        const password = req.body.password

        const authorized = process.env.ENCRYPTED ? remote === rc4(process.env.PASSWORD, password) : process.env.PASSWORD === password

        if (!authorized) {
            addAttempt(remote)
            return res.status(401).json({auth:false, message:"Unauthorized"})
        }

        deleteRemote(remote)
    
        const token = jwt.sign({ ip: remote }, process.env.TOKEN_KEY);
        return res.status(200).json({
            auth:true,
            token
        })
    }
    catch(error) {
        console.error(error)
        return res.status(500).json({auth:false, message:"Internal server error"})
    }
}