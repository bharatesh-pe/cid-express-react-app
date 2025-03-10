const jwt = require("jsonwebtoken");
const { admin_user_token } = require("../models");

const adminAuthMiddleware = async (req, res, next) => {
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

        // Attempt to find the token in admin_user_token table
        const tokenRecord = await admin_user_token.findOne({
            where: {
                token,
                admin_user_id: decoded.admin_user_id,
            },
        });

        if (!tokenRecord) {
            console.log("Token not found in admin_user_token database.");
            return res.status(401).json({ error: "Invalid or expired token." });
        }

        // Check if the token is expired
        const currentDate = new Date();
        const expireDate = new Date((decoded.iat * 1000) + (24 * 60 * 60 * 1000)); // `exp` is in seconds, so convert to milliseconds
        if (currentDate > expireDate) {
            console.log("Token expired.");
            return res.status(401).json({ error: "Token expired." });
        }

        console.log("Token valid for admin user.");

        // Attach admin user info to req and response locals
        req.admin_user = decoded;
        res.locals.admin_user_id = decoded.admin_user_id;

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

module.exports = adminAuthMiddleware;
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// const jwt = require("jsonwebtoken");
// const { admin_user_token } = require("../models");

// const adminAuthMiddleware = async (req, res, next) => {
//     const token = req.header("Authorization")?.replace("Bearer ", "");

//     // Temporarily bypass token verification
//     console.log("Bypassing token verification for development/testing purposes.");

//     req.admin_user = { admin_user_id: 3 }; // Mocked admin user
//     res.locals.admin_user_id = 3;         // Mocked admin user ID

//     // Proceed to the next middleware or route handler
//     return next();


// };

// module.exports = adminAuthMiddleware;
