const Sequelize = require("sequelize");
const db = require('../models');
const { Template, TemplateStar } = require("../models");
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

exports.toggleTemplateStar = async (req, res) => {
    const { template_id, table_row_id } = req.body;
    const user_id = res.locals.user_id;

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
            freezeTableName: true,
            timestamps: true,
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

        // Check if the combination of template_id, table_row_id, and user_id already exists
        const existingTemplateStar = await TemplateStar.findOne({
            where: {
                template_id,
                table_row_id,
                user_id,
            },
        });

        if (existingTemplateStar) {
            // If star exists, delete it
            await existingTemplateStar.destroy();
            return adminSendResponse(res, 200, true, 'Template star removed successfully.');
        } else {
            // If star doesn't exist, create it
            const newTemplateStar = await TemplateStar.create({
                template_id,
                table_row_id,
                user_id,
            });
            return adminSendResponse(res, 201, true, 'Template starred successfully.', newTemplateStar);
        }
    } catch (error) {
        console.error(error);
        return adminSendResponse(res, 500, false, 'An error occurred while toggling the template star.', null, error.message);
    }
};