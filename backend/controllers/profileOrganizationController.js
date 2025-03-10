const Sequelize = require("sequelize");
const db = require('../models');
const { Template, ProfileOrganization } = require("../models");
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


exports.addProfileOrganization = async (req, res) => {
    const { template_id, table_row_id, organization_id } = req.body;

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

        // Check if the combination of template_id, table_row_id, and organization_id already exists
        const existingProfileOrganization = await ProfileOrganization.findOne({
            where: {
                template_id,
                table_row_id,
                organization_id,
            },
        });

        if (existingProfileOrganization) {
            return adminSendResponse(res, 400, false, 'A Profile Organization with the same template_id, table_row_id, and organization_id already exists.');
        }

        // Create a new ProfileOrganization record
        const newProfileOrganization = await ProfileOrganization.create({
            template_id,
            table_row_id,
            organization_id,
        });

        return adminSendResponse(res, 201, true, 'Profile Organization created successfully.', newProfileOrganization);
    } catch (error) {
        console.error(error);
        return adminSendResponse(res, 500, false, 'An error occurred while creating the Profile Organization.', null, error.message);
    }
};


exports.updateProfileOrganization = async (req, res) => {
    const { profile_organization_id, template_id, table_row_id, organization_id } = req.body;

    try {
        // Fetch the existing ProfileOrganization by ID
        const profileOrganization = await ProfileOrganization.findOne({
            where: { profile_organization_id: profile_organization_id },
        });

        if (!profileOrganization) {
            return adminSendResponse(res, 404, false, 'Profile Organization not found.');
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

        // Check if the combination of template_id, table_row_id, and organization_id already exists
        const existingProfileOrganization = await ProfileOrganization.findOne({
            where: {
                template_id,
                table_row_id,
                organization_id,
            },
        });

        if (existingProfileOrganization && existingProfileOrganization.profile_organization_id !== profile_organization_id) {
            return adminSendResponse(res, 400, false, 'A different Profile Organization with the same template_id, table_row_id, and organization_id already exists.');
        }

        // Update the ProfileOrganization record
        await profileOrganization.update({
            template_id,
            table_row_id,
            organization_id,
        });

        return adminSendResponse(res, 200, true, 'Profile Organization updated successfully.', profileOrganization);
    } catch (error) {
        console.error(error);
        return adminSendResponse(res, 500, false, 'An error occurred while updating the Profile Organization.', null, error.message);
    }
};


exports.viewProfileOrganization = async (req, res) => {
    const { template_id, table_row_id, } = req.body;

    try {
        // Fetch the ProfileOrganization by ID
        const profileOrganization = await ProfileOrganization.findOne({
            where: {
                template_id: template_id,
                table_row_id: table_row_id
            },
        });

        if (!profileOrganization) {
            return adminSendResponse(res, 404, false, 'Profile Organization not found.');
        }

        return adminSendResponse(res, 200, true, 'Profile Organization fetched successfully.', profileOrganization);

    } catch (error) {
        console.error(error);
        return adminSendResponse(res, 500, false, 'An error occurred while fetching the Profile Organization.', null, error.message);
    }
};