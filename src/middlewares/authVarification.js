// const jwt = require('jsonwebtoken');
// require('dotenv').config();

// const JWToken = process.env.JWT_SECRET_KEY;

// module.exports = (req, res, next) => {
//     let token = req.headers['token'];
//     if (!token) {
//         return res.status(401).json({ status: "unauthorized" });
//     }
//     jwt.verify(token, JWToken, (err, decoded) => {
//         if (err) {
//             console.log('Token verification error:', err);
//             return res.status(401).json({ status: "unauthorized" });
//         } else {
//             let userName=decoded['data'];
//             console.log(userName)
//             req.headers.userName=userName
//             next();
//         }
//     });
// };
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWToken = process.env.JWT_SECRET_KEY;

module.exports = (req, res, next) => {
    const token = req.headers['token']; // Retrieve token from headers
    if (!token) {
        return res.status(401).json({ status: "unauthorized", message: "Token not provided" });
    }

    jwt.verify(token, JWToken, (err, decoded) => {
        if (err) {
            console.log('Token verification error:', err);

            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ status: "unauthorized", message: "Token has expired" });
            }

            return res.status(401).json({ status: "unauthorized", message: "Invalid token" });
        }

        // Token is valid; proceed to the next middleware
        const userName = decoded['data'];
        console.log(`Authenticated user: ${userName}`);
        req.headers.userName = userName; // Add userName to request headers
        next();
    });
};
