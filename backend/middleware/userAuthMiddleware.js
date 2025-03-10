const jwt = require("jsonwebtoken");
const { user_token } = require("../models");

const userAuthMiddleware = async (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        console.log("No token provided.");
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        console.log("Token received:", token);

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded token:", decoded);

        // Attempt to find the token in user_token table
        const tokenRecord = await user_token.findOne({
            where: {
                token,
                user_id: decoded.user_id,
            },
        });

        if (!tokenRecord) {
            console.log("Token not found in user_token database.");
            return res.status(401).json({ error: "Invalid or expired token." });
        }

        // Check if the token is expired
        const currentDate = new Date();
        const expireDate = new Date((decoded.iat * 1000) + (24 * 60 * 60 * 1000)); // `exp` is in seconds, so convert to milliseconds
        if (currentDate > expireDate) {
            console.log("Token expired.");
            return res.status(401).json({ error: "Token expired." });
        }

        console.log("Token valid for user.");

        // Attach user info to req and response locals
        req.user = decoded;
        res.locals.user_id = decoded.user_id;

        // Log token-related metadata (created_by, created_date, etc.)
        console.log("Token metadata:", {
            created_by: tokenRecord.created_by,
            created_date: tokenRecord.created_date,
            modified_by: tokenRecord.modified_by,
            modified_date: tokenRecord.modified_date,
        });

        next();
    } catch (error) {
        console.error("Token verification error:", error.message);
        return res.status(400).json({ error: "Invalid token." });
    }
};

module.exports = userAuthMiddleware;
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// const jwt = require("jsonwebtoken");
// const { user_token } = require("../models");

// const userAuthMiddleware = async (req, res, next) => {
//     // Temporarily bypass token verification
//     console.log("Bypassing token verification for development/testing purposes.");

//     // Mocked user object
//     req.user = { user_id: 1407 }; // Replace with a valid mocked user ID as needed
//     res.locals.user_id = 1407;    // Replace with a valid mocked user ID

//     console.log("Token treated as valid for development purposes.");

//     // Proceed to the next middleware or route handler
//     return next();


// };

// module.exports = userAuthMiddleware;
