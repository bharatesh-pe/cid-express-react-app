const { adminSendResponse } = require("../services/adminSendResponse")
const { userSendResponse } = require('../services/userSendResponse');
const db = require('../models');
const { Field } = require('../models');
const { admin_user_token, admin_user, leader, designation, units, section, desk, state, district, taluk } = require('../models');
const { user_token, user, organizations, unit_section_desks } = require('../models');
const CryptoJS = require('crypto-js');
const redisClient = require('../config/redisConfig');
const fs = require('fs');
const path = require('path');
const { folder_categories } = require('../models');
const sequelize = db.sequelize;
const { Op } = require("sequelize");
const loginController = async (req, res) => {
    try {
        const { token_id } = req.body;

        // Validate if the encrypted token ID is provided
        if (!token_id || typeof token_id !== "string") {
            return res.status(400).json({ success: false, message: "Valid encrypted token_id is required" });
        }

        // Decrypt the token ID
        let decryptedTokenId;
        try {
            const bytes = CryptoJS.AES.decrypt(token_id, process.env.JWT_SECRET);
            decryptedTokenId = bytes.toString(CryptoJS.enc.Utf8);
        } catch (decryptionError) {
            console.error("Decryption error:", decryptionError.message);
            return res.status(400).json({ success: false, message: "Invalid encrypted token_id" });
        }

        // Validate if the decrypted token ID is a valid number
        if (!decryptedTokenId || isNaN(decryptedTokenId)) {
            return res.status(400).json({ success: false, message: "Decrypted token_id is invalid" });
        }

        console.log("Decrypted token_id:", decryptedTokenId);

        // Attempt to find the token in both admin and user token tables
        const adminTokenData = await admin_user_token.findOne({
            where: { admin_user_token_id: decryptedTokenId },
            include: [{ model: admin_user, attributes: { exclude: ["password"] } }],
        });

        if (adminTokenData) {
            return adminSendResponse(res, 200, true, "Admin login successful", {
                token: adminTokenData.token,
                adminUser: adminTokenData.admin_user,
            });
        }

        const userTokenData = await user_token.findOne({
            where: { user_token_id: decryptedTokenId },
            include: [{ model: user, attributes: { exclude: ["password"] } }],
        });

        if (userTokenData) {
            return userSendResponse(res, 200, true, "User login successful", {
                token: userTokenData.token,
                user: userTokenData.user,
            });
        }

        // If neither admin nor user token is found
        return res.status(404).json({ success: false, message: "Token not found" });
    } catch (error) {
        console.error("Error in login:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


const adminLogin = async (req, res) => {
    try {
        const { admin_user_token_id } = req.body;

        // Validate if the encrypted token ID is provided
        if (!admin_user_token_id || typeof admin_user_token_id !== 'string') {
            return adminSendResponse(res, 400, false, "Valid encrypted admin_user_token_id is required");
        }

        // Decrypt the admin_user_token_id
        let decryptedTokenId;
        try {
            const bytes = CryptoJS.AES.decrypt(admin_user_token_id, process.env.JWT_SECRET); // Ensure `JWT_SECRET` is set
            decryptedTokenId = bytes.toString(CryptoJS.enc.Utf8);
        } catch (decryptionError) {
            console.error("Decryption error:", decryptionError.message);
            return adminSendResponse(res, 400, false, "Invalid encrypted admin_user_token_id");
        }

        // Validate if the decrypted token ID is a valid number
        if (!decryptedTokenId || isNaN(decryptedTokenId)) {
            return adminSendResponse(res, 400, false, "Decrypted admin_user_token_id is invalid");
        }

        console.log("Decrypted admin_user_token_id:", decryptedTokenId);

        // Fetch the token details along with the associated admin user
        const tokenData = await admin_user_token.findOne({
            where: { admin_user_token_id: decryptedTokenId },
            include: [
                {
                    model: admin_user,
                    attributes: { exclude: ['password'] }, // Exclude password from admin user details
                },
            ],
        });

        // Check if the token exists
        if (!tokenData) {
            return adminSendResponse(res, 404, false, "Token not found");
        }

        // Respond with the token and admin user details
        return adminSendResponse(res, 200, true, "Login successful", {
            token: tokenData.token,
            adminUser: tokenData.admin_user,
        });
    } catch (error) {
        console.error("Error in admin login:", error.message);
        return adminSendResponse(res, 500, false, "Internal Server Error");
    }
};
const encryptAdminUserTokenId = (req, res) => {
    try {
        const { admin_user_token_id } = req.body;

        // Validate if the token ID is provided and is a number
        if (!admin_user_token_id || typeof admin_user_token_id !== 'number') {
            return res.status(400).json({
                success: false,
                message: "Valid admin_user_token_id (number) is required",
            });
        }

        // Log the value to debug if needed
        console.log("admin_user_token_id:", admin_user_token_id);

        // Convert the number to a string before encryption
        const tokenIdAsString = admin_user_token_id.toString();

        // Encrypt the admin_user_token_id using CryptoJS
        const encryptedTokenId = CryptoJS.AES.encrypt(
            tokenIdAsString,
            process.env.JWT_SECRET // Ensure to set this in your environment variables
        ).toString();

        // Send the encrypted token ID in the response
        return res.status(200).json({
            success: true,
            message: "Token ID encrypted successfully",
            data: {
                encryptedAdminUserTokenId: encryptedTokenId,
            },
        });
    } catch (error) {
        console.error("Error in encrypting token ID:", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
const encryptUserTokenId = (req, res) => {
    try {
        const { user_token_id } = req.body;

        // Validate if the token ID is provided and is a number
        if (!user_token_id || typeof user_token_id !== 'number') {
            return adminSendResponse(res, 400, false, "Valid user_token_id (number) is required");
        }

        // Convert the token ID to a string and encrypt it
        const encryptedTokenId = CryptoJS.AES.encrypt(
            user_token_id.toString(),
            process.env.JWT_SECRET // Ensure JWT_SECRET is set in environment variables
        ).toString();

        // Respond with the encrypted token ID
        return adminSendResponse(res, 200, true, "Token ID encrypted successfully", {
            encryptedUserTokenId: encryptedTokenId,
        });
    } catch (error) {
        console.error("Error in encrypting token ID:", error.message);
        return adminSendResponse(res, 500, false, "Internal Server Error");
    }
};

const userLogin = async (req, res) => {
    try {
        const { user_token_id } = req.body;

        // Validate if the encrypted token ID is provided
        if (!user_token_id || typeof user_token_id !== 'string') {
            return userSendResponse(res, 400, false, "Valid encrypted user_token_id is required");
        }

        // Decrypt the user_token_id
        let decryptedTokenId;
        try {
            const bytes = CryptoJS.AES.decrypt(user_token_id, process.env.JWT_SECRET); // Ensure JWT_SECRET is set
            decryptedTokenId = bytes.toString(CryptoJS.enc.Utf8);
        } catch (decryptionError) {
            console.error("Decryption error:", decryptionError.message);
            return userSendResponse(res, 400, false, "Invalid encrypted user_token_id");
        }

        // Validate if the decrypted token ID is a valid number
        if (!decryptedTokenId || isNaN(decryptedTokenId)) {
            return userSendResponse(res, 400, false, "Decrypted user_token_id is invalid");
        }

        console.log("Decrypted user_token_id:", decryptedTokenId);

        // Fetch the token details along with the associated user
        const tokenData = await user_token.findOne({
            where: { user_token_id: decryptedTokenId },
            include: [
                {
                    model: user,
                    attributes: { exclude: ['password'] }, // Exclude password from user details
                },
            ],
        });

        // Check if the token exists
        if (!tokenData) {
            return userSendResponse(res, 404, false, "Token not found");
        }

        // Respond with the token and user details
        return userSendResponse(res, 200, true, "Login successful", {
            token: tokenData.token,
            user: tokenData.user,
        });
    } catch (error) {
        console.error("Error in user login:", error.message);
        return userSendResponse(res, 500, false, "Internal Server Error");
    }
};

const addField = async (req, res) => {
    try {
        const { json, field_name } = req.body;

        // Validate the field_name
        if (!field_name || typeof field_name !== 'string') {
            return adminSendResponse(res, 400, false, "Valid field_name is required");
        }

        // Validate the json object
        if (!json || typeof json !== 'object') {
            return adminSendResponse(res, 400, false, "Valid json data is required");
        }

        // Convert JSON object to string to preserve key order
        const jsonString = JSON.stringify(json);
        const existingData = await Field.findOne({
            where: { field_name },
        })

        if (existingData) {
            return adminSendResponse(res, 400, false, "Field name already exists", null, {
                existingData: "Field name already exists"
            });
        }


        // Add the json data to the database
        const newField = await Field.create({
            field_name, // Insert the field_name
            json: jsonString, // Save the JSON object as a string
        });

        await redisClient.del('fields');

        // Parse the JSON string back for the response
        const responseData = {
            ...newField.toJSON(),
            json: JSON.parse(newField.json),
        };

        // Respond with success message
        return adminSendResponse(res, 200, true, "Field added successfully", responseData);
    } catch (error) {
        console.error("Error in adding json:", error.message);
        return adminSendResponse(res, 500, false, "Internal Server Error");
    }
};

const updateField = async (req, res) => {
    try {
        const { field_id, field_name, json } = req.body;

        // Validate the field_id
        if (!field_id || typeof field_id !== 'number') {
            return adminSendResponse(res, 400, false, "Valid field_id is required");
        }

        // Validate the field_name
        if (field_name && typeof field_name !== 'string') {
            return adminSendResponse(res, 400, false, "field_name must be a string");
        }

        // Validate the json object
        if (json && typeof json !== 'object') {
            return adminSendResponse(res, 400, false, "json must be an object");
        }

        // Find the field by ID
        const field = await Field.findByPk(field_id);
        if (!field) {
            return adminSendResponse(res, 404, false, "Field not found");
        }

        // Convert JSON object to string if `json` is provided
        const jsonString = json ? JSON.stringify(json) : undefined;

        // Update the field data
        const updatedField = await field.update({
            ...(field_name && { field_name }), // Update field_name if provided
            ...(jsonString && { json: jsonString }), // Update json if provided
        });

        // Clear the cache for fields
        await redisClient.del('fields');

        // Parse the JSON string back for the response
        const responseData = {
            ...updatedField.toJSON(),
            json: updatedField.json ? JSON.parse(updatedField.json) : null, // Parse JSON string
        };

        // Respond with success message
        return adminSendResponse(res, 200, true, "Field updated successfully", responseData);
    } catch (error) {
        console.error("Error in updating field:", error.message);
        return adminSendResponse(res, 500, false, "Internal Server Error");
    }
};

const deleteField = async (req, res) => {
    try {
        const { field_id } = req.body;

        // Validate the field_id
        if (!field_id || typeof field_id !== 'number') {
            return adminSendResponse(res, 400, false, "Valid field_id is required");
        }

        // Find the field by ID
        const field = await Field.findByPk(field_id);
        if (!field) {
            return adminSendResponse(res, 404, false, "Field not found");
        }

        // Delete the field
        await field.destroy();
        await redisClient.del('fields');
        // Respond with success message
        return adminSendResponse(res, 200, true, "Field deleted successfully");
    } catch (error) {
        console.error("Error in deleting field:", error.message);
        return adminSendResponse(res, 500, false, "Internal Server Error");
    }
};

const getAllFields = async (req, res) => {
    try {
        // const cacheFields = await redisClient.get('fields');
        // if (cacheFields) {
        //     // Parse and sort cached data by field_id
        //     const sortedCacheFields = JSON.parse(cacheFields).sort((a, b) => a.field_id - b.field_id);
        //     return adminSendResponse(res, 200, true, "Fields retrieved successfully", sortedCacheFields);
        // }

        // Fetch all fields from the database
        const fields = await Field.findAll();

        // Check if fields exist
        if (!fields || fields.length === 0) {
            return adminSendResponse(res, 404, false, "No fields found");
        }

        // Parse the JSON field and structure response
        const fieldsWithJson = fields.map(field => {
            const fieldJson = JSON.parse(field.json);
            const { json, ...rest } = field.toJSON();
            return {
                ...rest,
                ...fieldJson,
            };
        });

        // Sort fields by field_id
        const sortedFields = fieldsWithJson.sort((a, b) => a.field_id - b.field_id);

        // Store the fields in the cache as stringified JSON
        await redisClient.set('fields', JSON.stringify(sortedFields));

        // Respond with sorted fields
        return adminSendResponse(res, 200, true, "Fields retrieved successfully", sortedFields);
    } catch (error) {
        console.error("Error in retrieving fields:", error.message);
        return adminSendResponse(res, 500, false, "Internal Server Error");
    }
};

const viewField = async (req, res) => {
    try {
        const { field_id } = req.body;

        // Validate the field_id
        if (!field_id || typeof field_id !== 'number') {
            return adminSendResponse(res, 400, false, "Valid field_id is required");
        }

        // Find the field by ID
        const field = await Field.findByPk(field_id);
        if (!field) {
            return adminSendResponse(res, 404, false, "Field not found");
        }

        // Parse the JSON field and spread its properties into the response object
        const fieldData = field.toJSON();
        const parsedJson = JSON.parse(fieldData.json || '{}'); // Safeguard in case json is null or undefined
        const fieldWithFlattenedJson = {
            ...fieldData,
            ...parsedJson // Spread the parsed JSON properties
        };
        delete fieldWithFlattenedJson.json; // Remove the original 'json' key if no longer needed

        // Respond with success message and the field data
        return adminSendResponse(res, 200, true, "Field retrieved successfully", fieldWithFlattenedJson);
    } catch (error) {
        console.error("Error in retrieving field:", error.message);
        return adminSendResponse(res, 500, false, "Internal Server Error");
    }
};



const paginateFields = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            sortBy = "created_at",
            order = "asc",
            search = "",
        } = req.body; // Get parameters from the request body

        const offset = (page - 1) * limit;
        const sort = [[sortBy, order.toUpperCase()]];

        // Build the where clause for search
        const where = {
            ...(search && {
                [Op.or]: [
                    { field_name: { [Op.like]: `%${search}%` } },
                    Sequelize.where(
                        Sequelize.json("json.label"),
                        { [Op.like]: `%${search}%` }
                    ),
                    Sequelize.where(
                        Sequelize.json("json.heading"),
                        { [Op.like]: `%${search}%` }
                    ),
                    Sequelize.where(
                        Sequelize.json("json.name"),
                        { [Op.like]: `%${search}%` }
                    ),
                ],
            }),
        };

        // Fetch fields with pagination, sorting, and search
        const fields = await Field.findAndCountAll({
            where,
            limit: parseInt(limit, 10),
            offset: parseInt(offset, 10),
            order: sort,
        });

        // Parse the `json` field for each row before sending the response
        // const fieldsWithJson = fields.rows.map(field => ({
        //     ...field.toJSON(),
        //     json: JSON.parse(field.json) // Parse the json field to an object
        // }));
        // Parse the `json` field and flatten its properties into the response for each row
        const transformedFields = fields.rows.map(field => {
            const fieldData = field.toJSON(); // Convert Sequelize object to plain object
            let parsedJson = {};

            try {
                // Parse the 'json' field into a plain object
                parsedJson = JSON.parse(fieldData.json);
            } catch (e) {
                console.error(`Error parsing JSON for field_id ${fieldData.field_id}:`, e.message);
            }

            // Merge the parsed JSON object into the main object
            return {
                ...fieldData,
                ...parsedJson,
                json: undefined, // Remove the original `json` key
            };
        });

        // Build and send the paginated response
        const responseData = {
            data: transformedFields,
            totalPages: Math.ceil(fields.count / limit),
            currentPage: parseInt(page, 10),
            totalItems: fields.count,
        };

        return adminSendResponse(
            res,
            200,
            true,
            "Fields retrieved successfully",
            responseData
        );
    } catch (error) {
        console.error("Error in paginateFields function:", error.message);
        return adminSendResponse(res, 500, false, "Internal Server Error");
    }
};

const getFormFields = async (req, res) => {
    try {
        const filePath = path.join(__dirname, '../services/formFields.json');

        // Check if the file exists
        if (!fs.existsSync(filePath)) {
            return adminSendResponse(res, 404, false, "Form fields file not found.");
        }

        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const formFields = JSON.parse(fileContent);

        // Return the file content in the response
        return adminSendResponse(res, 200, true, "Form fields fetched successfully.", formFields);
    } catch (error) {
        console.error("Error fetching form fields:", error);
        return adminSendResponse(res, 500, false, "Internal Server Error.", null, error.message);
    }
};

const getLeaders = async (req, res) => {
    try {
        // const cacheLeaders = await redisClient.get('leaders');
        // if (cacheLeaders) {
        //     return adminSendResponse(res, 200, true, "Leaders fetched successfully", JSON.parse(cacheLeaders));
        // }
        // Fetch active leaders along with related models
        const leaders = await leader.findAll({
            where: {
                is_active: true
            },
            order: [['leader_name', 'ASC']],
            include: [
                // { model: units, required: false },
                // { model: section, required: false },
                // { model: desk, required: false },
                // { model: user, attributes: ['full_name'] }
            ],
        });

        // await redisClient.setEx('leaders', 3600, JSON.stringify(leaders));
        return adminSendResponse(res, 200, true, "Leaders fetched successfully", leaders);
    } catch (error) {
        console.error("Error fetching leaders:", error.message);
        return adminSendResponse(res, 500, false, "Internal Server Error");
    }
};


const paginateLeaders = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.body;
        const offset = (page - 1) * limit;

        // Search condition
        const searchCondition = search
            ? {
                leader_name: {
                    [Op.like]: `%${search}%`
                }
            }
            : {};

        // Fetch active leaders with pagination, search, and related models
        const { count, rows: leaders } = await leader.findAndCountAll({
            where: {
                is_active: true,
                ...searchCondition
            },
            order: [['leader_name', 'ASC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
            include: [
                {
                    model: sequelize.models.units,
                    attributes: ['unit_name'],
                    required: false
                },
                {
                    model: sequelize.models.section,
                    attributes: ['section_name'],
                    required: false
                },
                {
                    model: sequelize.models.desk,
                    attributes: ['desk_name'],
                    required: false
                },
                {
                    model: sequelize.models.district,
                    attributes: ['district_name'],
                    required: false
                },
                {
                    model: sequelize.models.admin_user,
                    attributes: ['full_name'],
                    required: false
                }
            ],
        });

        const totalPages = Math.ceil(count / limit);

        return adminSendResponse(res, 200, true, "Leaders fetched successfully", {
            totalItems: count,
            totalPages,
            currentPage: parseInt(page),
            leaders
        });
    } catch (error) {
        console.error("Error fetching leaders:", error.message);
        return adminSendResponse(res, 500, false, "Internal Server Error");
    }
};



const getOrganizations = async (req, res) => {
    try {
        // const cacheOrganizations = await redisClient.get('organizations');
        // if (cacheOrganizations) {
        //     return adminSendResponse(res, 200, true, "Organizations fetched successfully", JSON.parse(cacheOrganizations));
        // }
        // Fetch active organizations
        const allOrganizations = await organizations.findAll({
            where: {
                is_active: true
            },
            order: [['organization_name', 'ASC']]
        });

        // await redisClient.setEx('organizations', 3600, JSON.stringify(allOrganizations));
        return adminSendResponse(res, 200, true, "Organizations fetched successfully", allOrganizations);
    } catch (error) {
        console.error("Error fetching organizations:", error.message);
        return adminSendResponse(res, 500, false, "Internal Server Error");
    }
};
const paginateOrganizations = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.body;
        const offset = (page - 1) * limit;

        // Search condition
        const searchCondition = search
            ? {
                organization_name: {
                    [Op.like]: `%${search}%`
                }
            }
            : {};

        // Fetch active organizations with pagination and search
        const { count, rows: allOrganizations } = await organizations.findAndCountAll({
            where: {
                is_active: true,
                ...searchCondition
            },
            order: [['organization_name', 'ASC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        const totalPages = Math.ceil(count / limit);

        return adminSendResponse(res, 200, true, "Organizations fetched successfully", {
            totalItems: count,
            totalPages,
            currentPage: parseInt(page),
            organizations: allOrganizations
        });
    } catch (error) {
        console.error("Error fetching organizations:", error.message);
        return adminSendResponse(res, 500, false, "Internal Server Error");
    }
};

const getDesignations = async (req, res) => {
    try {
        const cacheDesignations = await redisClient.get('designations');
        if (cacheDesignations) {
            return adminSendResponse(res, 200, true, "Designations fetched successfully", JSON.parse(cacheDesignations));
        }
        // Fetch active designations
        const designations = await designation.findAll({
            where: {
                is_active: true
            },
            order: [['designation_name', 'ASC']]
        });

        await redisClient.setEx('designations', 3600, JSON.stringify(designations));
        return adminSendResponse(res, 200, true, "Designations fetched successfully", designations);
    } catch (error) {
        console.error("Error fetching designations:", error.message);
        return adminSendResponse(res, 500, false, "Internal Server Error");
    }
};

const getUnits = async (req, res) => {
    try {
        // const cacheUnits = await redisClient.get('units');
        // if (cacheUnits) {
        //     return adminSendResponse(res, 200, true, "Units fetched successfully", JSON.parse(cacheUnits));
        // }
        // Fetch active units
        const allUnits = await units.findAll({
            where: {
                is_active: true
            },
            order: [['unit_name', 'ASC']]
        });

        // await redisClient.setEx('units', 3600, JSON.stringify(allUnits));
        return adminSendResponse(res, 200, true, "Units fetched successfully", allUnits);
    } catch (error) {
        console.error("Error fetching units:", error.message);
        return adminSendResponse(res, 500, false, "Internal Server Error");
    }
};

const getSections = async (req, res) => {
    try {
        const { unit_id } = req.body; // Extract unit_id from req.body

        if (!unit_id) {
            return adminSendResponse(res, 400, false, "Unit ID is required");
        }

        // const cacheSections = await redisClient.get(`sections_${unit_id}`);
        // if (cacheSections) {
        //     return adminSendResponse(res, 200, true, "Sections fetched successfully", JSON.parse(cacheSections));
        // }

        // Fetch data from unit_section_desks filtered by unit_id
        const data = await unit_section_desks.findAll({
            attributes: ['unit_id'], // Only fetch unit_id from unit_section_desks
            where: { unit_id }, // Filter by unit_id
            include: [
                {
                    model: section, // Include the associated section model
                    required: true, // Ensure only records with valid sections are returned
                }
            ],
            group: ['unit_section_desks.unit_id', 'section.section_id'], // Group by unit_id and section_id
            order: [
                [{ model: section }, 'section_id', 'ASC'], // Order by section_id
            ],
        });

        if (data.length === 0) {
            return adminSendResponse(res, 404, false, "No sections found for the given unit");
        }

        // Transform the data into the desired format
        const transformedData = data.map(item => item.section);

        // await redisClient.setEx(`sections_${unit_id}`, 3600, JSON.stringify(transformedData));
        // Return the transformed data
        return adminSendResponse(res, 200, true, "Sections fetched successfully", transformedData);
    } catch (error) {
        console.error("Error fetching data:", error.message);
        return adminSendResponse(res, 500, false, "Internal Server Error");
    }
};


const getDesks = async (req, res) => {
    try {
        const { unit_id, section_id } = req.body; // Extract unit_id and section_id from req.body

        // Validate inputs
        if (!unit_id || !section_id) {
            return adminSendResponse(res, 400, false, "Unit ID and Section ID are required");
        }

        // const cacheKey = `desks_${unit_id}_${section_id}`;
        // const cacheDesks = await redisClient.get(cacheKey);
        // if (cacheDesks) {
        //     return adminSendResponse(res, 200, true, "Desks fetched successfully", JSON.parse(cacheDesks));
        // }

        // Fetch data filtered by unit_id and section_id
        const data = await unit_section_desks.findAll({
            attributes: ['desk_id'], // Fetch only desk_id from unit_section_desks
            where: { unit_id, section_id }, // Filter by unit_id and section_id
            include: [
                {
                    model: desk, // Include the associated Desk model
                    attributes: ['desk_id', 'desk_name'], // Fetch desk_id and desk_name
                    required: true, // Ensure only records with valid desks are returned
                },
            ],
            order: [['desk_id', 'ASC']], // Order desks by their ID
        });

        if (data.length === 0) {
            return adminSendResponse(res, 404, false, "No desks found for the given Unit and Section");
        }

        // Transform data to only include desk information
        const transformedData = data.map((item) => ({
            desk_id: item.desk.desk_id,
            desk_name: item.desk.desk_name,
        }));

        // Cache the transformed data
        // await redisClient.setEx(cacheKey, 3600, JSON.stringify(transformedData));

        // Return the transformed data directly
        return adminSendResponse(res, 200, true, "Desks fetched successfully", transformedData);
    } catch (error) {
        console.error("Error fetching desks:", error.message);
        return adminSendResponse(res, 500, false, "Internal Server Error");
    }
};


const getStates = async (req, res) => {
    try {

        // const cacheStates = await redisClient.get('states');
        // if (cacheStates) {
        //     return adminSendResponse(res, 200, true, "States fetched successfully", JSON.parse(cacheStates));
        // }
        // Fetch active states
        const states = await state.findAll({
            where: {
                // is_active: true
            },
            order: [['state_name', 'ASC']]
        });

        // await redisClient.setEx('states', 3600, JSON.stringify(states));
        return adminSendResponse(res, 200, true, "States fetched successfully", states);
    } catch (error) {
        console.error("Error fetching states:", error.message);
        return adminSendResponse(res, 500, false, "Internal Server Error");
    }
};


const getDistricts = async (req, res) => {
    try {
        const { state_id } = req.body; // Extract state_id from req.body

        // Validate state_id
        if (!state_id) {
            return adminSendResponse(res, 400, false, "State ID is required");
        }

        // const cacheKey = `districts:${state_id}`;
        // const cacheDistricts = await redisClient.get(cacheKey);
        // if (cacheDistricts) {
        //     return adminSendResponse(res, 200, true, "Districts fetched successfully", JSON.parse(cacheDistricts));
        // }

        // Fetch districts filtered by state_id and is_active
        const districts = await district.findAll({
            where: {
                state_id, // Filter by state_id
                // is_active: true,
            },
            order: [['district_name', 'ASC']], // Order districts by name
        });

        if (districts.length === 0) {
            return adminSendResponse(res, 404, false, "No districts found for the given State ID");
        }

        // Transform data into the desired structure
        const transformedData = districts.map((d) => ({
            district_id: d.district_id,
            district_name: d.district_name,
        }));

        // Cache the transformed data
        // await redisClient.setEx(cacheKey, 3600, JSON.stringify(transformedData));

        // Return the response
        return adminSendResponse(res, 200, true, "Districts fetched successfully", transformedData);
    } catch (error) {
        console.error("Error fetching districts:", error.message);
        return adminSendResponse(res, 500, false, "Internal Server Error");
    }
};

const getTaluks = async (req, res) => {
    try {
        const { district_id } = req.body; // Extract district_id from req.body

        // Validate district_id
        if (!district_id) {
            return adminSendResponse(res, 400, false, "District ID is required");
        }

        // Fetch taluks filtered by district_id and optionally by is_active
        const taluks = await taluk.findAll({
            where: {
                district_id,
                // is_active: true, // Uncomment if filtering by active status is needed
            },
            order: [['taluk_name', 'ASC']], // Order taluks by name
        });

        if (taluks.length === 0) {
            return adminSendResponse(res, 404, false, "No taluks found for the given District ID");
        }

        // Transform data into the desired structure
        const transformedData = taluks.map((t) => ({
            taluk_id: t.taluk_id,
            taluk_name: t.taluk_name,
        }));

        // Return the response
        return adminSendResponse(res, 200, true, "Taluks fetched successfully", transformedData);
    } catch (error) {
        console.error("Error fetching taluks:", error.message);
        return adminSendResponse(res, 500, false, "Internal Server Error");
    }
};

const getAllFolderCategories = async (req, res) => {
    try {
        // Fetch all active folder categories, ordered by folder_id
        const allFolders = await folder_categories.findAll({
            where: {
                is_active: true
            },
            order: [['folder_id', 'ASC']]
        });

        return adminSendResponse(res, 200, true, "Folder categories fetched successfully", allFolders);
    } catch (error) {
        console.error("Error fetching folder categories:", error.message);
        return adminSendResponse(res, 500, false, "Internal Server Error");
    }
};

module.exports = {
    adminLogin,
    encryptAdminUserTokenId,
    encryptUserTokenId,
    userLogin,
    addField,
    updateField,
    deleteField,
    getAllFields,
    viewField,
    paginateFields,
    getLeaders,
    getOrganizations,
    getDesignations,
    getUnits,
    getSections,
    getDesks,
    getStates,
    getDistricts,
    getFormFields,
    loginController,
    getAllFolderCategories,
    getTaluks,
    paginateLeaders,
    paginateOrganizations
};
