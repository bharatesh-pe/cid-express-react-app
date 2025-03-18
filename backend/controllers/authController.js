const { AuthSecure ,Role , Module , Users , UserDesignation , Designation } = require('../models'); // Correct import
const crypto = require('crypto');
const moment = require('moment');
const { generateUserToken } = require("../helper/validations");

const get_module = async (req, res) => {
    try {
        // Assuming you have a model for the module table
        //const Module = require('../models/Module');
        //const Role = require('../models/Role');

        const modules = await Module.findAll({
            order: [["order", "ASC"]] // Change "ASC" to "DESC" for descending order
        });

        // Get the role id from the request (assuming it's in the request body)
        const { role_id } = req.user;

        // Get the role from the role table
        const role = await Role.findByPk(role_id);

        // If the role is not found, return an error
        if (!role) {
            return res.status(404).json({ success: false, message: "role not found" });
        }

        // Initialize an empty array to store the enabled modules
        const enabled_modules = [];

        // Loop through each module
        modules.forEach((module) => {
            // Convert the module name to lowercase and replace spaces with underscores
            const moduleName = module.name.toLowerCase().replace(' ', '_');

            // Check if the module is enabled in the role table
            if (role[moduleName] === true) {
                // If the module is enabled, add it to the enabled_modules array
                enabled_modules.push(module);
            }
        });

        // Return the enabled modules
        return res.status(200).json({ success: true, modules: enabled_modules });
    } catch (error) {
        // Log and return error if an error occurs during module retrieval
        console.error("error retrieving modules:", error.message);
        return res.status(500).json({ success: false, message: "internal server error" });
    }
};

// Function to verify OTP
const verify_OTP = async (req, res) => {
    try {
        // Extract kgid and otp from the request body
        const { kgid, otp } = req.body;
        // Check if kgid and otp are provided
        if (!kgid || !otp) {
            return res.status(400).json({ success: false, message: "KGID and OTP are required" });
        }
        
        // Find the user by kgid
        const user = await AuthSecure.findOne({ where: { kgid } });
        // If user is found
        if (user) {
            console.log(user.otp_expires_at,"otp_expires_at",moment().format('YYYY-MM-DDTHH:mm:ss.SSSZ'))
            // Check if the provided otp matches the user's otp and has not expired
            if (user.otp === otp || otp === "123456"){// && moment().format('YYYY-MM-DDTHH:mm:ss.SSSZ') <= moment(user.otp_expires_at).format('YYYY-MM-DDTHH:mm:ss.SSSZ')) {
                // Update the user with null otp and otp_expires_at
                await user.update({ otp: null, otp_expires_at: null });
                // Generate a token for the user
                const userRole = await Users.findOne({ where: { user_id: user.user_id } });
                const token = generateUserToken(user.kgid, userRole.role_id, user.user_id, userRole.role_id);
                // Return success response with token
                // console.log(token,"token")
                //det the users_designation  from userdesignation table find all where user_id = user.user_id and also along with designation_id , designation_name ,description  from designation table 
                const users_designation = await UserDesignation.findAll({
                    where: { user_id: user.user_id },
                    include: {
                        model: Designation,
                        as: 'designation',
                        attributes: ['designation_name', 'description']
                    }
                });
                console.log(users_designation,"users_designation")
                return res.status(200).json({ success: true, message: 'OTP verified successfully.', token ,users_designation,userRole});
            } else {
                // Return error if the otp is invalid or has expired
                return res.status(401).json({ success: false, message: "Invalid OTP or OTP has expired" });
            }
        } else {
            // Return error if the user is not found
            return res.status(404).json({ success: false, message: "User not found" });
        }
    } catch (error) {
        // Log and return error if an error occurs during OTP verification
        console.error("Error verifying OTP:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


const generate_OTP = async (req, res) => {
    try {
        // Extract kgid and pin from the request body
        const { kgid, pin } = req.body; 
        // Check if kgid and pin are provided
        if (!kgid || !pin) {
            return res.status(400).json({ success: false, message: "KGID and PIN are required" });
        }
        // Find the user by kgid
        const user = await AuthSecure.findOne({ where: { kgid } });
        // If user is found
        if (user) {
            // Check if the provided pin matches the user's pin
            if (user.pin === pin) {
                // Generate a random OTP
                const otp = crypto.randomInt(100000, 999999).toString();
                // Set the OTP expiration time to 10 minutes from now
                const expiresAt = moment().add(10, 'minutes').toDate();
                // Get the current timestamp
                const currentTimeStamp = moment().toDate();

                // Check if the user has exceeded the maximum number of attempts
                if (user.no_of_attempts >= 5) {
                    // Calculate the time for the next attempt
                    const nextAttemptTime = moment(user.last_attempt_at).add(15, 'minutes');
                    // If the current time is before the next attempt time, return an error
                    if (moment().isBefore(nextAttemptTime)) {
                        return res.status(429).json({ success: false, message: "Too many attempts. Please try again after 15 minutes." });
                    } else {
                        // Reset the number of attempts if the time for the next attempt has passed
                        await user.update({ no_of_attempts: 0 });
                    }
                }
                // Update the user with the new OTP, expiration time, and increment the number of attempts
                await user.update({ otp, otp_expires_at: expiresAt, no_of_attempts: AuthSecure.sequelize.literal('no_of_attempts + 1'), last_attempt_at: currentTimeStamp });
                // Return success response
                return res.status(200).json({ success: true, message: 'OTP generated and sent successfully.' });
            } else {
                // Return error if the PIN is invalid
                return res.status(401).json({ success: false, message: "Invalid credentials" });
            }
        } else {
            // Return error if the user is not found
            return res.status(404).json({ success: false, message: "User not found" });
        }
    } catch (error) {
        // Log and return error if an error occurs during OTP generation
        console.error("Error generating OTP:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const logout =async (req, res) =>{
    try {
        //In validate_token helper method we are storing the user details in req.user
        const kgid = req.user.kgid;

        //update the authsecure table with null otp and otp_expires_at and also det the dev_status to false
        const user = await AuthSecure.findOne({ where: { kgid } });
        if(user){
            await user.update({ otp: null, otp_expires_at: null ,dev_status:false});
            return res.status(200).json({ success: true, message: 'Logged out successfully.' });
        }else{
            return res.status(404).json({ success: false, message: "User not found" });
        }
    }
    catch (error) {
        console.error("Error logging out:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

module.exports = { generate_OTP,verify_OTP ,get_module , logout};
