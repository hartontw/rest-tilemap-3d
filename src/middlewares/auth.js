import jwt from 'jsonwebtoken'

export default (req, res, next) => {
    if (!process.env.PASSWORD) return next()

    const token = req.headers['x-access-token'];
    if (token) {        
        try {
            const decoded = jwt.verify(token, process.env.TOKEN_KEY);
            if (decoded.ip === req.connection.remoteAddress.toString()) {
                return next();
            }
        }
        catch(error){}
    }

    return res.status(401).json({
        auth: false,
        message: 'No valid token provided'
    });
}