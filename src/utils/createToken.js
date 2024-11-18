const jwt = require('jsonwebtoken');
require('dotenv').config();

const CreateToken = async (data) => {
    try {
        // Include _id from userData in the token payload
        const payload = {
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // Expiration time
            data: data,
            _id: data._id// Include additional user data if needed
        };

        // Generate and return the token
        return jwt.sign(payload, process.env.JWT_SECRET_KEY);
    } catch (error) {
        throw new Error(error.message);
    }
};

module.exports = CreateToken;
