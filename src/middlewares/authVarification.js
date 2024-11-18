const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWToken = process.env.JWT_SECRET_KEY;

module.exports = (req, res, next) => {
    let token = req.headers['token'];
    if (!token) {
        return res.status(401).json({ status: "unauthorized" });
    }
    jwt.verify(token, JWToken, (err, decoded) => {
        if (err) {
            console.log('Token verification error:', err);
            return res.status(401).json({ status: "unauthorized" });
        } else {
            let userName=decoded['data'];
            console.log(userName)
            req.headers.userName=userName
            next();
        }
    });
};
