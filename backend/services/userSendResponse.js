// const { UserLog } = require("../models/database1/UserLog"); // Ensure correct import
const { UserLog } = require('../models');
const userSendResponse = async (
    res,
    statusCode,
    success,
    message,
    data = null,
    errors = null
) => {
    const response = {
        success,
        message,
    };

    if (data !== null) response.data = data;
    if (errors !== null) response.errors = errors;

    // Prepare the API log details
    const userApiLog = {
        user_id: res.locals.user ? res.locals.user.id : null, // Retrieve user ID from locals
        api_name: res.req.originalUrl, // API endpoint
        api_request: JSON.stringify(res.req.body), // Request payload
        status: statusCode,
        ip_address: res.req.ip, // Client IP address
        message: message,
        api_response: JSON.stringify(response), // Response body

    };

    try {
        // Store the log in the database
        if (UserLog && typeof UserLog.create === "function") {
            await UserLog.create(userApiLog);

        } else {
            console.warn("UserLog model is not defined or not initialized.");
        }
    } catch (error) {
        console.error("Failed to log API request:", error.message || error);
    }

    // Send response
    res.status(statusCode).json(response);
};

module.exports = {
    userSendResponse,
};
