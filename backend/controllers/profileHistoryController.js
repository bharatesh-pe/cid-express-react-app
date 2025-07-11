const Sequelize = require("sequelize");
const db = require('../models');
const { Template, ProfileHistory, CaseHistory, Users , KGID } = require("../models");
const sequelize = db.sequelize;
const { Op } = require("sequelize");
// Import the Template and Comment models
const { userSendResponse } = require("../services/userSendResponse");

const typeMapping = {
    STRING: Sequelize.DataTypes.STRING,
    INTEGER: Sequelize.DataTypes.INTEGER,
    TEXT: Sequelize.DataTypes.TEXT,
    DATE: Sequelize.DataTypes.DATE,
    BOOLEAN: Sequelize.DataTypes.BOOLEAN,
    FLOAT: Sequelize.DataTypes.FLOAT,
    DOUBLE: Sequelize.DataTypes.DOUBLE,
    JSONB: Sequelize.DataTypes.JSONB,
};




exports.getProfileHistory = async (req, res, next) => {
    try {
        const { template_id, table_row_id, field_name } = req.body;

        // Get the logged-in user's user_id from res.locals
        const user_id = req.user?.user_id || null;

        if (!user_id) {
            return userSendResponse(res, 401, false, "Unauthorized: User not logged in.");
        }

        // Fetch the template details
        const template = await Template.findOne({
            where: { template_id },
        });
        if (!template) {
            return userSendResponse(res, 404, false, "Template not found.");
        }

        const { table_name, fields } = template;
        const schema = typeof fields === "string" ? JSON.parse(fields) : fields;

        // Dynamically create the model based on the schema
        const modelAttributes = {};
        for (const field of schema) {
            const { name: columnName, data_type, not_null, default_value } = field;

            const sequelizeType = typeMapping[data_type.toUpperCase()] || Sequelize.DataTypes.STRING;
            modelAttributes[columnName] = {
                type: sequelizeType,
                allowNull: not_null ? false : true,
                defaultValue: default_value || null,
            };
        }

        const DynamicModel = sequelize.define(table_name, modelAttributes, {
            freezeTableName: true,
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        });

        // Synchronize the model with the database
        await DynamicModel.sync();

        // Validate table_row_id
        const record = await DynamicModel.findOne({
            where: { id: table_row_id },
        });
        if (!record) {
            return userSendResponse(res, 404, false, `No record found in table '${table_name}' with id ${table_row_id}.`);
        }

        // Build the filter object dynamically
        const filter = {
            template_id,
            table_row_id
        };

        if (field_name) {
            filter.field_name = field_name;
        }

        // Fetch Profile History with user details and optional field_name filter
        let profileHistory = await ProfileHistory.findAll({
            where: filter,
            order: [["created_at", "DESC"]],
            include: [
                {
                    model: Users,
                    as: 'userDetails',
                    attributes: ['kgid_id'],  
                    include: [
                       {
                            model: KGID,
                            as: "kgidDetails",
                            attributes: ["kgid", "name", "mobile"  ],
                        },
                    ],  
                    
                }
            ]
        });

        // profileHistory = profileHistory.map((history) => {
        //     const { userDetails } = history;
        //     const { kgidDetails } = userDetails;
        //     return {
        //         ...history.toJSON(),
        //         userDetails: {
        //             kgid: kgidDetails.kgid,
        //             user_firstname: kgidDetails.name,
        //             mobile: kgidDetails.mobile,
        //         },
        //     };
        // });

        profileHistory = await Promise.all(profileHistory.map(async (history) => {
            const { userDetails } = history;
            const { kgidDetails } = userDetails;
        
            let oldValueDetails = null;
            let updatedValueDetails = null;
        
            if (field_name === "field_io_name") {
                // Fetch details for old_value (user_id)
                if (history.old_value) {
                    const oldUser = await Users.findOne({
                        where: { user_id: history.old_value },
                        attributes: ["kgid_id"]
                    });
                    if (oldUser && oldUser.kgid_id) {
                        const oldKGID = await KGID.findOne({
                            where: { id: String(oldUser.kgid_id) },
                            attributes: ["kgid", "name", "mobile"]
                        });
                        if (oldKGID) {
                            oldValueDetails = {
                                kgid: oldKGID.kgid,
                                name: oldKGID.name,
                                mobile: oldKGID.mobile
                            };
                        }
                    }
                }
                // Fetch details for updated_value (user_id)
                if (history.updated_value) {
                    const updatedUser = await Users.findOne({
                        where: { user_id: history.updated_value },
                        attributes: ["kgid_id"]
                    });
                    if (updatedUser && updatedUser.kgid_id) {
                        const updatedKGID = await KGID.findOne({
                            where: { id: String(updatedUser.kgid_id) },
                            attributes: ["kgid", "name", "mobile"]
                        });
                        if (updatedKGID) {
                            updatedValueDetails = {
                                kgid: updatedKGID.kgid,
                                name: updatedKGID.name,
                                mobile: updatedKGID.mobile
                            };
                        }
                    }
                }
            }
        
            return {
                ...history.toJSON(),
                userDetails: {
                    kgid: kgidDetails.kgid,
                    user_firstname: kgidDetails.name,
                    mobile: kgidDetails.mobile,
                },
                ...(field_name === "field_io_name" ? {
                    old_value_details: oldValueDetails,
                    updated_value_details: updatedValueDetails
                } : {})
            };
        }));

        if (profileHistory.length === 0) {
            return userSendResponse(res, 404, false, "No records found for the specified filters.");
        }

        return userSendResponse(res, 200, true, "Profile History retrieved successfully.", profileHistory);

    } catch (error) {
        console.error(error);
        return userSendResponse(res, 500, false, "Internal Server Error.", null, error.message);
    }
};

exports.getCaseHistory = async (req, res, next) => {
    try {
        const { template_id, table_row_id, field_name } = req.body;

        // Get the logged-in user's user_id from res.locals
        const user_id = req.user?.user_id || null;

        if (!user_id) {
            return userSendResponse(res, 401, false, "Unauthorized: User not logged in.");
        }

        // Fetch the template details
        const template = await Template.findOne({
            where: { template_id },
        });
        if (!template) {
            return userSendResponse(res, 404, false, "Template not found.");
        }

        const { table_name, fields } = template;
        const schema = typeof fields === "string" ? JSON.parse(fields) : fields;

        // Dynamically create the model based on the schema
        const modelAttributes = {};
        for (const field of schema) {
            const { name: columnName, data_type, not_null, default_value } = field;

            const sequelizeType = typeMapping[data_type.toUpperCase()] || Sequelize.DataTypes.STRING;
            modelAttributes[columnName] = {
                type: sequelizeType,
                allowNull: not_null ? false : true,
                defaultValue: default_value || null,
            };
        }

        const DynamicModel = sequelize.define(table_name, modelAttributes, {
            freezeTableName: true,
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        });

        // Synchronize the model with the database
        await DynamicModel.sync();

        // Validate table_row_id
        const record = await DynamicModel.findOne({
            where: { id: table_row_id },
        });
        if (!record) {
            return userSendResponse(res, 404, false, `No record found in table '${table_name}' with id ${table_row_id}.`);
        }

        // Build the filter object dynamically
        const filter = {
            template_id,
            table_row_id
        };


        // Fetch Profile History with user details and optional field_name filter
        let CaseLog = await CaseHistory.findAll({
            where: filter,
            order: [["created_at", "DESC"]],
        });

        CaseLog = CaseLog.map((history) => {
            return {
                ...history.toJSON(),
            };
        });

        if (CaseLog.length === 0) {
            return userSendResponse(res, 404, false, "No records found for the specified filters.");
        }

        return userSendResponse(res, 200, true, "Case History retrieved successfully.", CaseLog);

    } catch (error) {
        console.error(error);
        return userSendResponse(res, 500, false, "Internal Server Error.", null, error.message);
    }
};
