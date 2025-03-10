const Sequelize = require("sequelize");
const db = require('../models');
const { Template, ProfileLeader } = require("../models");
const sequelize = db.sequelize;
const { Op } = require("sequelize");
const { adminSendResponse } = require("../services/adminSendResponse");
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


exports.addProfileLeader = async (req, res) => {
    const { template_id, table_row_id, leader_id } = req.body;

    try {
        // Fetch the template details
        const template = await Template.findOne({
            where: { template_id },
        });

        if (!template) {
            return adminSendResponse(res, 404, false, 'Template not found.');
        }

        const { table_name, fields } = template;
        const schema = typeof fields === 'string' ? JSON.parse(fields) : fields;

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

        const DynamicModel = db.sequelize.define(table_name, modelAttributes, {
            freezeTableName: true, // Prevent Sequelize from pluralizing table names
            timestamps: true,      // Enable createdAt and updatedAt columns
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        });

        // Synchronize the model with the database
        await DynamicModel.sync();

        // Fetch the table_row_id from the dynamic table
        const tableRow = await DynamicModel.findOne({
            where: { id: table_row_id },
        });

        if (!tableRow) {
            return adminSendResponse(res, 404, false, 'Table row not found.');
        }

        // Check if the combination of template_id, table_row_id, and leader_id already exists
        const existingProfileLeader = await ProfileLeader.findOne({
            where: {
                template_id,
                table_row_id,
                leader_id,
            },
        });

        if (existingProfileLeader) {
            return adminSendResponse(res, 400, false, 'A ProfileLeader with the same template_id, table_row_id, and leader_id already exists.');
        }

        // Create a new ProfileLeader record
        const newProfileLeader = await ProfileLeader.create({
            template_id,
            table_row_id,
            leader_id,
        });

        return adminSendResponse(res, 201, true, 'ProfileLeader created successfully.', newProfileLeader);
    } catch (error) {
        console.error(error);
        return adminSendResponse(res, 500, false, 'An error occurred while creating the ProfileLeader.', null, error.message);
    }
};


exports.updateProfileLeader = async (req, res) => {
    const { profile_leader_id, template_id, table_row_id, leader_id } = req.body;

    try {
        // Fetch the existing ProfileLeader by ID
        const profileLeader = await ProfileLeader.findOne({
            where: { profile_leader_id: profile_leader_id },
        });

        if (!profileLeader) {
            return adminSendResponse(res, 404, false, 'ProfileLeader not found.');
        }

        // Fetch the template details
        const template = await Template.findOne({
            where: { template_id },
        });

        if (!template) {
            return adminSendResponse(res, 404, false, 'Template not found.');
        }

        const { table_name, fields } = template;
        const schema = typeof fields === 'string' ? JSON.parse(fields) : fields;

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

        const DynamicModel = db.sequelize.define(table_name, modelAttributes, {
            freezeTableName: true, // Prevent Sequelize from pluralizing table names
            timestamps: true,      // Enable createdAt and updatedAt columns
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        });

        // Synchronize the model with the database
        await DynamicModel.sync();

        // Fetch the table_row_id from the dynamic table
        const tableRow = await DynamicModel.findOne({
            where: { id: table_row_id },
        });

        if (!tableRow) {
            return adminSendResponse(res, 404, false, 'Table row not found.');
        }

        // Check if the combination of template_id, table_row_id, and leader_id already exists
        const existingProfileLeader = await ProfileLeader.findOne({
            where: {
                template_id,
                table_row_id,
                leader_id,
            },
        });

        if (existingProfileLeader && existingProfileLeader.profile_leader_id !== profile_leader_id) {
            return adminSendResponse(res, 400, false, 'A ProfileLeader with the same template_id, table_row_id, and leader_id already exists.');
        }

        // Update the ProfileLeader record
        await profileLeader.update({
            template_id,
            table_row_id,
            leader_id,
        });

        return adminSendResponse(res, 200, true, 'ProfileLeader updated successfully.', profileLeader);
    } catch (error) {
        console.error(error);
        return adminSendResponse(res, 500, false, 'An error occurred while updating the ProfileLeader.', null, error.message);
    }
};


exports.viewProfileLeader = async (req, res) => {
    const { template_id, table_row_id, } = req.body;

    try {
        // Fetch the ProfileLeader by ID
        const profileLeader = await ProfileLeader.findOne({
            where: {
                template_id: template_id,
                table_row_id: table_row_id
            },
        });

        if (!profileLeader) {
            return adminSendResponse(res, 404, false, 'ProfileLeader not found.');
        }

        // Fetch the template details
        const template = await Template.findOne({
            where: { template_id: profileLeader.template_id },
        });

        if (!template) {
            return adminSendResponse(res, 404, false, 'Template not found for the ProfileLeader.');
        }

        const { table_name, fields } = template;
        const schema = typeof fields === 'string' ? JSON.parse(fields) : fields;

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

        const DynamicModel = db.sequelize.define(table_name, modelAttributes, {
            freezeTableName: true, // Prevent Sequelize from pluralizing table names
            timestamps: true,      // Enable createdAt and updatedAt columns
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        });

        // Synchronize the model with the database
        await DynamicModel.sync();

        // Fetch the table_row_id details from the dynamic table
        const tableRow = await DynamicModel.findOne({
            where: { id: profileLeader.table_row_id },
        });

        if (!tableRow) {
            return adminSendResponse(res, 404, false, 'Table row not found for the ProfileLeader.');
        }

        // Construct the response
        // const responseData = {
        //     profileLeader,
        //     template: {
        //         template_id: template.template_id,
        //         table_name: template.table_name,
        //         fields: schema,
        //     },
        //     tableRow,
        // };

        return adminSendResponse(res, 200, true, 'ProfileLeader fetched successfully.', profileLeader);
    } catch (error) {
        console.error(error);
        return adminSendResponse(res, 500, false, 'An error occurred while fetching the ProfileLeader.', null, error.message);
    }
};
