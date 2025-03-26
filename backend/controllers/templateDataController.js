const Sequelize = require("sequelize");
const db = require('../models');
const sequelize = db.sequelize;
const { Template, admin_user, user, ActivityLog, Download, ProfileAttachment, ProfileHistory, event, event_tag_organization, event_tag_leader, event_summary, ProfileLeader, ProfileOrganization, TemplateStar, TemplateUserStatus, UiProgressReportFileStatus} = require("../models");
const { userSendResponse } = require("../services/userSendResponse");
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

const { Op } = require("sequelize");
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const uuid = require('uuid');
const ExcelJS = require('exceljs');
const UPLOADS_FOLDER = path.join(__dirname, '../uploads');
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


exports.insertTemplateData = async (req, res, next) => {
    const { table_name, data, folder_attachment_ids } = req.body;
    // const userId = res.locals.user_id || null;
    const adminUserId = res.locals.admin_user_id || null;
    const {user_id} = req.user;
    const userId = user_id;
    const actorId = userId || adminUserId;

    console.log("inserting user", userId, actorId);
    // const adminUserName = await admin_user.findOne({
    //     where: { admin_user_id: adminUserId },
    //     attributes: ['full_name']
    // });

    // const userName = await user.findOne({
    //     where: { user_id: userId },
    //     attributes: ['user_firstname']
    // });
    // const actorName = adminUserName?.full_name || userName?.user_firstname;
    const actorName = "abc"



    // if (!actorId) {
    //     return userSendResponse(res, 403, false, "Unauthorized access.", null);
    // }

    try {
        const tableData = await Template.findOne({ where: { table_name } });
        console.log("?????????????", tableData)

        if (!tableData) {
            const message = `Table ${table_name} does not exist.`;
            return userSendResponse(res, 400, false, message, null);
        }

        const schema = typeof tableData.fields === "string" ? JSON.parse(tableData.fields) : tableData.fields;
        const validData = {};

        const cleanedData = data.replace(/\/\/.*|\/\*[\s\S]*?\*\/|,\s*}/g, match => (match.includes(",") ? "}" : ""));
        const parsedData = JSON.parse(cleanedData);

        for (const field of schema) {
            const { name, not_null, default_value } = field;

            if (parsedData.hasOwnProperty(name)) {
                validData[name] = parsedData[name];
            } else if (not_null && default_value === undefined) {
                return userSendResponse(res, 400, false, `Field ${name} cannot be null.`, null);
            } else if (default_value !== undefined) {
                validData[name] = default_value;
            }
        }

        const completeSchema = parsedData?.sys_status
             ? [
                 {
                     name: "sys_status",
                     data_type: "TEXT",
                     not_null: false,
                     default_value: parsedData.sys_status.trim() // Add trim() to clean the input
                 },
                 ...schema
             ]
             : schema;
        const modelAttributes = {};
        for (const field of completeSchema) {
            const { name, data_type, not_null, default_value } = field;
            const sequelizeType = typeMapping[data_type.toUpperCase()] || Sequelize.DataTypes.STRING;
            modelAttributes[name] = {
                type: sequelizeType,
                allowNull: !not_null,
                defaultValue: default_value || null,
            };
        }

        const Model = sequelize.define(table_name, modelAttributes, {
            freezeTableName: true,
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        });
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>", modelAttributes)
        const insertedData = await Model.create(validData);

        // await ActivityLog.create({
        //     template_id: tableData.template_id,
        //     table_row_id: insertedData.id,
        //     user_id: actorId,
        //     actor_name: actorName,
        //     activity: `Created`,
        // });

        const fileUpdates = {};


        if (req.files && req.files.length > 0) {
            const folderAttachments = folder_attachment_ids ? JSON.parse(folder_attachment_ids) : []; // Parse if provided, else empty array

            for (const file of req.files) {
                const { originalname, size, key, fieldname } = file;
                const fileExtension = path.extname(originalname);

                // Find matching folder_id from the payload (if any)
                const matchingFolder = folderAttachments.find(
                    attachment => attachment.filename === originalname && attachment.field_name === fieldname
                );

                const folderId = matchingFolder ? matchingFolder.folder_id : null; // Set NULL if not found or missing folder_attachment_ids

                await ProfileAttachment.create({
                    template_id: tableData.template_id,
                    table_row_id: insertedData.id,
                    attachment_name: originalname,
                    attachment_extension: fileExtension,
                    attachment_size: size,
                    s3_key: key,
                    field_name: fieldname,
                    folder_id: folderId, // Store NULL if no folder_id provided
                });

                if (!fileUpdates[fieldname]) {
                    fileUpdates[fieldname] = originalname;
                } else {
                    fileUpdates[fieldname] += `,${originalname}`;
                }
            }

            // Update the model with file arrays
            for (const [fieldname, filenames] of Object.entries(fileUpdates)) {
                await Model.update(
                    { [fieldname]: filenames },
                    { where: { id: insertedData.id } }
                );
            }
        }


        return userSendResponse(res, 200, true, `Data inserted successfully into table ${table_name}.`, null);

    } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            const uniqueErrorField = error.errors[0]?.path || "a unique field";
            return userSendResponse(res, 400, false, `${uniqueErrorField} already exists.`, null);
        }

        if (error.name === "SequelizeValidationError") {
            const validationErrorField = error.errors[0]?.path || "a required field";
            return userSendResponse(res, 400, false, `${validationErrorField} is required.`, null);
        }

        console.error("Error inserting data:", error);
        return userSendResponse(res, 500, false, "Server error.", error);
    }
};


async function getDisplayValueForField(field, value, schema) {
    // If value is null or undefined, return it as is
    if (value === null || value === undefined) {
        return value;
    }

    // Find field schema
    const fieldSchema = schema.find(f => f.name === field);
    if (!fieldSchema) return value;

    // Convert value to appropriate type for comparison
    let valueToCompare = value;
    if (fieldSchema.data_type === 'integer' && !isNaN(Number(value))) {
        valueToCompare = Number(value);
    }

    // Handle different field types
    if (fieldSchema.type === 'dropdown' || fieldSchema.type === 'radio') {
        // Handle options based fields (dropdown, radio)
        if (Array.isArray(fieldSchema.options)) {
            const option = fieldSchema.options.find(opt => {
                // Compare as number if the field data type is integer
                if (fieldSchema.data_type === 'integer') {
                    return Number(opt.code) === valueToCompare;
                }
                return opt.code === valueToCompare;
            });

            if (option) {
                return option.name;
            }
        }
    } else if (fieldSchema.type === 'checkbox') {
        // Handle checkbox fields (multiple selections)
        if (Array.isArray(fieldSchema.options) && value) {
            const codes = String(value).split(',').map(code => code.trim());
            return codes.map(code => {
                const option = fieldSchema.options.find(opt => {
                    if (fieldSchema.data_type === 'integer') {
                        return Number(opt.code) === Number(code);
                    }
                    return opt.code === code;
                });
                return option ? option.name : code;
            }).join(', ');
        }
    }

    // Handle table references (foreign keys)
    if (fieldSchema.table && fieldSchema.attributes) {
        try {
            // Handle both array and string attributes
            let attributeName;
            if (Array.isArray(fieldSchema.attributes)) {
                attributeName = fieldSchema.attributes[0];
            } else {
                attributeName = fieldSchema.attributes;
            }

            // Get table model
            const RelatedModel = require(`../models`)[fieldSchema.table];
            if (RelatedModel) {
                // For districts and other dependent tables
                let whereClause = {};
                if (fieldSchema.forign_key) {
                    // If there's a specific foreign key defined, use it for the query
                    whereClause[fieldSchema.forign_key] = valueToCompare;
                } else {
                    // Default to the primary key
                    whereClause['id'] = valueToCompare;
                }

                // Query the related model
                const relatedRecord = await RelatedModel.findOne({
                    where: whereClause
                });

                if (relatedRecord && relatedRecord[attributeName]) {
                    return relatedRecord[attributeName];
                }
            } else {
                // If model not found, try direct SQL query for tables not defined in models
                const [result] = await sequelize.query(
                    `SELECT ${attributeName} FROM ${fieldSchema.table} WHERE ${fieldSchema.forign_key || 'id'} = :value LIMIT 1`,
                    {
                        replacements: { value: valueToCompare },
                        type: Sequelize.QueryTypes.SELECT
                    }
                );

                if (result && result[attributeName]) {
                    return result[attributeName];
                }
            }
        } catch (error) {
            console.error(`Error fetching related record for ${field}:`, error);
        }
    }

    // If no transformation was possible, return the original value
    return value;
}
exports.updateTemplateData = async (req, res, next) => {
    const { table_name, id, data, folder_attachment_ids } = req.body;
    // const userId = res.locals.user_id || null;
    // const adminUserId = res.locals.admin_user_id || null;
    // const actorId = userId || adminUserId;

    // const adminUserName = await admin_user.findOne({
    //     where: { admin_user_id: adminUserId },
    //     attributes: ['full_name']
    // });

    // const userName = await user.findOne({
    //     where: { user_id: userId },
    //     attributes: ['user_firstname']
    // });
    // const actorName = adminUserName?.full_name || userName?.user_firstname;
    const actorName = "kvn"
    // if (!actorId) {
    //     return userSendResponse(res, 403, false, "Unauthorized access.", null);
    // }

    try {
        // Fetch the table template
        const tableData = await Template.findOne({ where: { table_name } });

        if (!tableData) {
            return userSendResponse(res, 400, false, `Table ${table_name} does not exist.`, null);
        }

        // Parse schema and request data
        const schema = typeof tableData.fields === "string" ? JSON.parse(tableData.fields) : tableData.fields;
        const validData = {};

        // Parse incoming JSON payload
        const cleanedData = data.replace(/\/\/.*|\/\*[\s\S]*?\*\/|,\s*}/g, match => {
            return match.includes(",") ? "}" : "";
        });
        const parsedData = JSON.parse(cleanedData);

        // Validate and filter data for schema-based fields
        for (const field of schema) {
            const { name, not_null } = field;

            if (parsedData.hasOwnProperty(name)) {
                validData[name] = parsedData[name];
            } else if (not_null && !parsedData[name]) {
                return userSendResponse(res, 400, false, `Field ${name} cannot be null.`, null);
            }
        }
        


        // Define Sequelize model dynamically
        const modelAttributes = {};
        for (const field of schema) {
            const { name, data_type, not_null, default_value } = field;
            const sequelizeType = typeMapping[data_type.toUpperCase()] || Sequelize.DataTypes.STRING;
            modelAttributes[name] = {
                type: sequelizeType,
                allowNull: !not_null,
                defaultValue: default_value || null,
            };
        }

        const Model = sequelize.define(table_name, modelAttributes, {
            freezeTableName: true,
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        });

        // Find existing record by ID
        const ids = id.split(',').map(id => id.trim());

        for (const singleId of ids) {
            // Find existing record by ID
            const record = await Model.findByPk(singleId);
            if (!record) {
                return userSendResponse(res, 400, false, `Record with ID ${singleId} does not exist in table ${table_name}.`, null);
            }

        const originalData = record.toJSON();
        const updatedFields = {};

        // Update fields only if they are changed
        for (const key in validData) {
            if (originalData[key] !== validData[key]) {
                updatedFields[key] = validData[key];
            }
        }

        // Perform the database update if there are changes
        if (Object.keys(updatedFields).length > 0) {
            await record.update(updatedFields);

            // Log changes in ProfileHistory (Only for changed fields)
            // if (userId) {
            //     for (const key in updatedFields) {
            //         const oldValue = originalData.hasOwnProperty(key) ? originalData[key] : null;
            //         const newValue = updatedFields[key];

            //         console.log(">>>>>oldValue1>>>>>>>>", oldValue);
            //         console.log(">>>>>>newValue1>>>>>>>", newValue);

            //         const oldDisplayValue = await getDisplayValueForField(key, oldValue, schema);
            //         const newDisplayValue = await getDisplayValueForField(key, newValue, schema);

            //         console.log(">>>>>oldDisplayValue>>>>>>>>", oldDisplayValue);
            //         console.log(">>>>newDisplayValue>>>>>>>>>", newDisplayValue);

            //         // Only log changes, not unchanged fields
            //         if (oldValue !== newValue) {
            //             await ProfileHistory.create({
            //                 template_id: tableData.template_id,
            //                 table_row_id: id,
            //                 user_id: userId,
            //                 field_name: key,
            //                 old_value: oldDisplayValue !== null ? String(oldDisplayValue) : null,
            //                 updated_value: newDisplayValue !== null ? String(newDisplayValue) : null,
            //             });
            //         }
            //     }
            // }

            // await ActivityLog.create({
            //     template_id: tableData.template_id,
            //     table_row_id: id,
            //     user_id: actorId,
            //     actor_name: actorName,
            //     activity: `Updated`,
            // });
        }

        const fileUpdates = {};

        if (req.files && req.files.length > 0) {
            const folderAttachments = folder_attachment_ids ? JSON.parse(folder_attachment_ids) : []; // Parse if provided, else empty array

            for (const file of req.files) {
                const { originalname, size, key, fieldname } = file;
                const fileExtension = path.extname(originalname);

                // Find matching folder_id from the payload (if any)
                const matchingFolder = folderAttachments.find(
                    attachment => attachment.filename === originalname && attachment.field_name === fieldname
                );

                const folderId = matchingFolder ? matchingFolder.folder_id : null; // Store NULL if no folder_id provided

                await ProfileAttachment.create({
                    template_id: tableData.template_id,
                    table_row_id: id,
                    attachment_name: originalname,
                    attachment_extension: fileExtension,
                    attachment_size: size,
                    s3_key: key,
                    field_name: fieldname,
                    folder_id: folderId, // Store NULL if no folder_id provided
                });

                // Fetch current field value if it exists
                const existingRecord = await Model.findOne({
                    where: { id },
                    attributes: [fieldname]
                });

                let currentFilenames = existingRecord?.[fieldname] || "";

                // Append new filename to the existing comma-separated list
                currentFilenames = currentFilenames
                    ? `${currentFilenames},${originalname}`
                    : originalname;

                // Add/accumulate new filenames for each field
                if (fileUpdates[fieldname]) {
                    fileUpdates[fieldname] = `${fileUpdates[fieldname]},${originalname}`;
                } else {
                    fileUpdates[fieldname] = currentFilenames;
                }
            }

            // Update the model with the updated filenames
            for (const [fieldname, filenames] of Object.entries(fileUpdates)) {
                await Model.update(
                    { [fieldname]: filenames },
                    { where: { id: singleId } }
                );
            }
        }
    }


        // await TemplateUserStatus.destroy({
        //     where: {
        //         template_id: tableData.template_id,
        //         table_row_id: id
        //     }
        // });


        return userSendResponse(res, 200, true, `Data updated successfully in table ${table_name}.`, null);
    } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            const uniqueErrorField = error.errors[0]?.path || "a unique field";
            return userSendResponse(res, 400, false, `${uniqueErrorField} already exists. Please use a different value.`, null);
        }

        if (error.name === "SequelizeValidationError") {
            const validationErrorField = error.errors[0]?.path || "a required field";
            return userSendResponse(res, 400, false, `${validationErrorField} is required and cannot be null.`, null);
        }

        console.error("Error updating data:", error);
        return userSendResponse(res, 500, false, "Server error.", error);
    }
};

exports.deleteFileFromTemplate = async (req, res, next) => {
    const { profile_attachment_id } = req.body;  // Get profile_attachment_id from request body

    try {
        // Step 1: Fetch the attachment entry to get necessary details
        const attachment = await ProfileAttachment.findOne({ where: { profile_attachment_id } });

        if (!attachment) {
            return userSendResponse(res, 400, false, `Attachment with ID ${profile_attachment_id} not found.`, null);
        }

        const { template_id, table_row_id, attachment_name, field_name } = attachment;

        // Step 2: Remove the attachment from ProfileAttachment table
        await ProfileAttachment.destroy({
            where: { profile_attachment_id }
        });

        // Step 3: Remove the filename from the table's field
        const tableData = await Template.findOne({ where: { template_id } });
        if (!tableData) {
            return userSendResponse(res, 400, false, `Table with ID ${template_id} not found.`, null);
        }

        const schema = typeof tableData.fields === "string" ? JSON.parse(tableData.fields) : tableData.fields;
        const modelName = tableData.table_name;

        // Define Sequelize model for dynamic table
        const modelAttributes = {};
        for (const field of schema) {
            const { name, data_type, not_null, default_value } = field;
            const sequelizeType = typeMapping[data_type.toUpperCase()] || Sequelize.DataTypes.STRING;
            modelAttributes[name] = {
                type: sequelizeType,
                allowNull: !not_null,
                defaultValue: default_value || null,
            };
        }

        const Model = sequelize.define(modelName, modelAttributes, {
            freezeTableName: true,
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        });

        // Step 4: Fetch the existing record to update the field
        const record = await Model.findByPk(table_row_id);
        if (!record) {
            return userSendResponse(res, 400, false, `Record with ID ${table_row_id} not found.`, null);
        }

        const currentFieldValue = record[field_name] || "";
        const updatedFieldValue = currentFieldValue
            .split(",")
            .filter(filename => filename !== attachment_name) // Remove the deleted file name
            .join(",");

        // Step 5: Update the field to remove the filename
        await Model.update(
            { [field_name]: updatedFieldValue },
            { where: { id: table_row_id } }
        );

        return userSendResponse(res, 200, true, `File and entry deleted successfully.`, null);
    } catch (error) {
        console.error("Error deleting file from template:", error);
        return userSendResponse(res, 500, false, "Server error.", error);
    }
};



exports.getTemplateData = async (req, res, next) => {
    const { table_name , field_case } = req.body;
    // const userId = res.locals.user_id || null;
    // const adminUserId = res.locals.admin_user_id || null;
    // const actorId = userId || adminUserId;


    // Get actor's name
    // const adminUserName = await admin_user.findOne({
    //     where: { admin_user_id: adminUserId },
    //     attributes: ['full_name']
    // });
    // const userName = await user.findOne({
    //     where: { user_id: userId },
    //     attributes: ['user_firstname']
    // });
    // const actorName = adminUserName?.full_name || userName?.user_firstname;
    const actorName = "abc"
    // if (!actorId) {
    //     return userSendResponse(res, 403, false, "Unauthorized access.", null);
    // }

    try {
        // Fetch the template metadata
        const tableData = await Template.findOne({ where: { table_name } });

        if (!tableData) {
            const message = `Table ${table_name} does not exist.`;
            return userSendResponse(res, 400, false, message, null);
        }

        // Parse the schema fields from Template
        const schema = typeof tableData.fields === "string" ? JSON.parse(tableData.fields) : tableData.fields;

        // Filter fields that have is_primary_field as true
        const filteredSchema = schema.filter(field => field.is_primary_field === true);

        // Define model attributes based on filtered schema
        const modelAttributes = {
            id: {
                type: Sequelize.DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            created_at: {
                type: Sequelize.DataTypes.DATE,
                allowNull: false,
            },
            updated_at: {
                type: Sequelize.DataTypes.DATE,
                allowNull: false,
            }
        };
        const associations = [];

        for (const field of filteredSchema) {
            const { name: columnName, data_type, not_null, default_value, table, forign_key, attributes } = field;

            if (!columnName || !data_type) {
                console.warn(`Missing required attributes for field ${columnName}. Using default type STRING.`);
                modelAttributes[columnName] = {
                    type: Sequelize.DataTypes.STRING,
                    allowNull: not_null ? false : true,
                    defaultValue: default_value || null,
                };
                continue;
            }

            // Handle data_type mapping to Sequelize types
            const sequelizeType = typeMapping[data_type.toUpperCase()] || Sequelize.DataTypes.STRING;
            modelAttributes[columnName] = {
                type: sequelizeType,
                allowNull: not_null ? false : true,
                defaultValue: default_value || null,
            };

            // Handle foreign key associations dynamically
            if (table && forign_key && attributes) {
                associations.push({
                    relatedTable: table,
                    foreignKey: columnName,
                    targetAttribute: attributes,
                });
            }
        }

        // Define and sync the dynamic model
        const Model = sequelize.define(table_name, modelAttributes, {
            freezeTableName: true,
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        });

        // Dynamically define associations
        const include = [];
        // Uncomment and adjust if needed to include associations
        // for (const association of associations) {
        //     const RelatedModel = require(`../models`)[association.relatedTable];

        //     if (RelatedModel) {
        //         Model.belongsTo(RelatedModel, {
        //             foreignKey: association.foreignKey,
        //             as: `${association.relatedTable}Details`,
        //         });

        //         include.push({
        //             model: RelatedModel,
        //             as: `${association.relatedTable}Details`,
        //         });
        //     }
        // }

        await Model.sync();

        const whereClause = field_case && field_case != ''  ? { field_case } : {};

        // Fetch data with dynamic includes
        const records = await Model.findAll({
            where: whereClause,
            include,
        });


        // Transform the response to include only primary fields and metadata fields
        const transformedRecords = records.map(record => {
            const data = record.toJSON();
            const filteredData = {
                id: data.id,
                created_at: data.created_at,
                updated_at: data.updated_at,
            };

            // Include only fields that are primary
            filteredSchema.forEach(field => {
                if (field.is_primary_field === true) {
                    filteredData[field.name] = data[field.name];
                }
            });

            return filteredData;
        });

        // Log the user activity
        // await ActivityLog.create({
        //     template_id: tableData.template_id,
        //     table_row_id: 0,
        //     user_id: actorId,
        //     actor_name: actorName,
        //     activity: `Viewed`,
        // });

        const responseMessage = `Fetched data successfully from table ${table_name}.`;
        return userSendResponse(res, 200, true, responseMessage, transformedRecords);

    } catch (error) {
        console.error("Error fetching data:", error);
        return userSendResponse(res, 500, false, "Server error.", error);
    }
};




exports.viewTemplateData = async (req, res, next) => {
    const { table_name, id } = req.body;
    // const userId = res.locals.user_id || null;
    // const adminUserId = res.locals.admin_user_id || null;
    // const actorId = userId || adminUserId;
    // const adminUserName = await admin_user.findOne({
    //     where: { admin_user_id: adminUserId },
    //     attributes: ['full_name']
    // });

    // const userName = await user.findOne({
    //     where: { user_id: userId },
    //     attributes: ['user_firstname']
    // });
    // const actorName = adminUserName?.full_name || userName?.user_firstname;
    // const actorName = "abc"
    // if (!actorId) {
    //     return userSendResponse(res, 403, false, "Unauthorized access.", null);
    // }

    try {
        const tableData = await Template.findOne({ where: { table_name } });

        if (!tableData) {
            const message = `Table ${table_name} does not exist.`;
            return userSendResponse(res, 400, false, message, null);
        }

        const schema = typeof tableData.fields === "string" ? JSON.parse(tableData.fields) : tableData.fields;

        const modelAttributes = {};

        for (const field of schema) {
            const { name: columnName, data_type, not_null, default_value } = field;

            if (!columnName || !data_type) {
                console.warn(`Missing required attributes for field ${columnName}. Using default type STRING.`);
                modelAttributes[columnName] = {
                    type: Sequelize.DataTypes.STRING,
                    allowNull: not_null ? false : true,
                    defaultValue: default_value || null,
                };
                continue;
            }

            const sequelizeType = typeMapping[data_type.toUpperCase()] || Sequelize.DataTypes.STRING;
            modelAttributes[columnName] = {
                type: sequelizeType,
                allowNull: not_null ? false : true,
                defaultValue: default_value || null,
            };
        }

        const Model = sequelize.define(table_name, modelAttributes, {
            freezeTableName: true,
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        });

        await Model.sync();

        const record = await Model.findOne({ where: { id } });

        if (!record) {
            const message = `Record with ID ${id} not found in table ${table_name}.`;
            return userSendResponse(res, 404, false, message, null);
        }

        const data = record.toJSON();

        delete data.deleted_at;
        delete data.created_at;
        delete data.updated_at;

        // const attachments = await ProfileAttachment.findAll({
        //     where: {
        //         template_id: tableData.template_id,
        //         table_row_id: id,
        //     },
        //     order: [['created_at', 'DESC']]
        // });

        // if (attachments.length) {
        //     data.attachments = attachments.map(att => att.toJSON());
        // }
        // if (userId) {
        //     await TemplateUserStatus.findOrCreate({
        //         where: {
        //             template_id: tableData.template_id,
        //             table_row_id: id,
        //             user_id: userId
        //         },
        //         defaults: {
        //             created_at: new Date(),
        //             updated_at: new Date()
        //         }
        //     });
        // }

        // await ActivityLog.create({
        //     template_id: tableData.template_id,
        //     table_row_id: id,
        //     user_id: actorId,
        //     actor_name: actorName,
        //     activity: `Viewed `,
        // });

        const responseMessage = `Fetched record successfully from table ${table_name}.`;
        return userSendResponse(res, 200, true, responseMessage, data);

    } catch (error) {
        console.error("Error fetching data by ID:", error);
        return userSendResponse(res, 500, false, "Server error.", error);
    }
};

exports.viewMagazineTemplateData = async (req, res) => {
    try {
        const { table_name, id } = req.body;
        // const userId = res.locals.user_id || null;
        // const adminUserId = res.locals.admin_user_id || null;
        // const actorId = userId || adminUserId;


        // const adminUserName = await admin_user.findOne({
        //     where: { admin_user_id: adminUserId },
        //     attributes: ['full_name']
        // });

        // const userName = await user.findOne({
        //     where: { user_id: userId },
        //     attributes: ['user_firstname']
        // });
        // const actorName = adminUserName?.full_name || userName?.user_firstname;
        const actorName = "abc"
        if (!table_name) {
            return userSendResponse(res, 400, false, "Table name is required.", null);
        }

        if (!id) {
            return userSendResponse(res, 400, false, "ID is required.", null);
        }

        const tableTemplate = await Template.findOne({ where: { table_name } });
        if (!tableTemplate) {
            return userSendResponse(res, 404, false, `Table ${table_name} does not exist.`, null);
        }

        let fieldsArray;
        try {
            fieldsArray = typeof tableTemplate.fields === 'string' ? JSON.parse(tableTemplate.fields) : tableTemplate.fields;
        } catch (err) {
            console.error("Error parsing fields:", err);
            return userSendResponse(res, 500, false, "Invalid table schema format.", null);
        }

        if (!Array.isArray(fieldsArray)) {
            return userSendResponse(res, 500, false, "Fields must be an array in the table schema.", null);
        }

        const fields = {};
        const radioFieldMappings = {};
        const checkboxFieldMappings = {};
        const dropdownFieldMappings = {};
        const associations = [];

        for (const field of fieldsArray) {
            const { name: columnName, data_type, max_length, not_null, default_value, options, type, table, forign_key, attributes } = field;

            const sequelizeType = data_type?.toUpperCase() === 'VARCHAR' && max_length
                ? Sequelize.DataTypes.STRING(max_length)
                : Sequelize.DataTypes[data_type?.toUpperCase()] || Sequelize.DataTypes.STRING;

            fields[columnName] = {
                type: sequelizeType,
                allowNull: !not_null,
                defaultValue: default_value || null,
            };

            if (type === 'radio' && Array.isArray(options)) {
                radioFieldMappings[columnName] = options.reduce((acc, option) => {
                    acc[option.code] = option.name;
                    return acc;
                }, {});
            }

            if (type === 'checkbox' && Array.isArray(options)) {
                checkboxFieldMappings[columnName] = options.reduce((acc, option) => {
                    acc[option.code] = option.name;
                    return acc;
                }, {});
            }

            if (type === 'dropdown' && Array.isArray(options)) {
                dropdownFieldMappings[columnName] = options.reduce((acc, option) => {
                    acc[option.code] = option.name;
                    return acc;
                }, {});
            }

            if (table && forign_key && attributes) {
                associations.push({
                    relatedTable: table,
                    foreignKey: columnName,
                    targetAttribute: attributes,
                });
            }
        }

        const DynamicTable = sequelize.define(table_name, fields, {
            freezeTableName: true,
            timestamps: true,
        });

        const include = [];
        for (const association of associations) {
            const RelatedModel = require(`../models`)[association.relatedTable];
            if (RelatedModel) {
                DynamicTable.belongsTo(RelatedModel, {
                    foreignKey: association.foreignKey,
                    as: `${association.relatedTable}Details`,
                });

                include.push({
                    model: RelatedModel,
                    as: `${association.relatedTable}Details`,
                    attributes: association.targetAttribute || { exclude: ['created_date', 'modified_date'] },
                });
            }
        }

        const result = await DynamicTable.findOne({
            where: { id },
            attributes: ['id', ...Object.keys(fields)],
            include,
        });

        if (!result) {
            return userSendResponse(res, 404, false, `Record with ID ${id} not found in ${table_name}.`, null);
        }

        let data = result.toJSON();

        for (const fieldName in radioFieldMappings) {
            if (data[fieldName] !== undefined && radioFieldMappings[fieldName][data[fieldName]]) {
                data[fieldName] = radioFieldMappings[fieldName][data[fieldName]];
            }
        }

        for (const fieldName in checkboxFieldMappings) {
            if (data[fieldName]) {
                const codes = data[fieldName].split(',').map(code => code.trim());
                data[fieldName] = codes.map(code => checkboxFieldMappings[fieldName][code] || code).join(', ');
            }
        }

        for (const fieldName in dropdownFieldMappings) {
            if (data[fieldName] !== undefined && dropdownFieldMappings[fieldName][data[fieldName]]) {
                data[fieldName] = dropdownFieldMappings[fieldName][data[fieldName]];
            }
        }

        // Fetch Profile Organization or Leader ID if applicable
        if (tableTemplate.is_link_to_organization) {
            const profileOrganization = await ProfileOrganization.findOne({
                where: { template_id: tableTemplate.template_id, table_row_id: id },
                attributes: ['organization_id'],
            });
            if (profileOrganization) {
                data.organization_id = profileOrganization.organization_id;
            }
        }

        if (tableTemplate.is_link_to_leader) {
            const profileLeader = await ProfileLeader.findOne({
                where: { template_id: tableTemplate.template_id, table_row_id: id },
                attributes: ['leader_id'],
            });
            if (profileLeader) {
                data.leader_id = profileLeader.leader_id;
            }
        }

        // const attachments = await ProfileAttachment.findAll({
        //     where: {
        //         template_id: tableTemplate.template_id,
        //         table_row_id: data.id,
        //     },
        //     order: [['created_at', 'DESC']]
        // });

        // if (attachments.length) {
        //     data.attachments = attachments.map(att => att.toJSON());
        // }

        for (const association of associations) {
            const alias = `${association.relatedTable}Details`;
            if (data[alias]) {
                Object.entries(data[alias]).forEach(([key, value]) => {
                    data[association.foreignKey] = value;
                    delete data[alias];
                });
            }
        }
        // if (userId) {
        //     await TemplateUserStatus.findOrCreate({
        //         where: {
        //             template_id: tableTemplate.template_id,
        //             table_row_id: id,
        //             user_id: userId
        //         },
        //         defaults: {
        //             created_at: new Date(),
        //             updated_at: new Date()
        //         }
        //     });

        // }
        // await ActivityLog.create({
        //     template_id: tableTemplate.template_id,
        //     table_row_id: id,
        //     user_id: actorId,
        //     actor_name: actorName,
        //     activity: `Viewed `,
        // });

        return userSendResponse(res, 200, true, "Data fetched successfully", data);
    } catch (error) {
        console.error('Error fetching view data:', error);
        return userSendResponse(res, 500, false, "Server error", error);
    }
};



exports.deleteTemplateData = async (req, res, next) => {
    try {
        const { table_name, where } = req.body;
        // const userId = res.locals.user_id || null;
        // const adminUserId = res.locals.admin_user_id || null;
        // const actorId = userId || adminUserId;

        // const adminUserName = await admin_user.findOne({
        //     where: { admin_user_id: adminUserId },
        //     attributes: ['full_name']
        // });

        // const userName = await user.findOne({
        //     where: { user_id: userId },
        //     attributes: ['user_firstname']
        // });
        // const actorName = adminUserName?.full_name || userName?.user_firstname;
        const actorName = "abc"
        // Retrieve table Template
        const tableData = await Template.findOne({
            where: { table_name },
        });

        if (!tableData) {
            return userSendResponse(res, 400, false, "Requested table does not exist.", null);
        }

        // Parse fields since it is stored as JSON string
        let fields;
        try {
            fields = JSON.parse(tableData.fields);
        } catch (err) {
            return userSendResponse(res, 500, false, "Invalid fields format in template.", null);
        }

        const modelAttributes = {};
        let hasDeletedAt = false; // Track if 'deleted_at' column exists

        fields.forEach((field) => {
            const { name: fieldName, data_type, not_null, default_value, max_length } = field;

            if (fieldName === "deleted_at") {
                hasDeletedAt = true; // Mark if 'deleted_at' exists
            }

            let sequelizeType;
            if (data_type && data_type.toUpperCase() === "VARCHAR" && max_length) {
                sequelizeType = Sequelize.DataTypes.STRING(max_length);
            } else if (data_type) {
                sequelizeType =
                    Sequelize.DataTypes[data_type.toUpperCase()] || Sequelize.DataTypes.STRING;
            } else {
                sequelizeType = Sequelize.DataTypes.STRING;
            }

            modelAttributes[fieldName] = {
                type: sequelizeType,
                allowNull: !not_null,
                defaultValue: default_value || null,
            };
        });

        // Define the model using Sequelize
        const Model = sequelize.define(table_name, modelAttributes, {
            freezeTableName: true,
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
            deletedAt: "deleted_at", // Map 'deleted_at' if it exists
        });

        // Sync model to ensure schema exists in the database
        await Model.sync();

        // Check if the data exists for the provided 'where' condition
        const data = await Model.findOne({ where });

        if (!data) {
            return userSendResponse(res, 200, false, "Data not found.", null);
        }

        if (hasDeletedAt) {
            // If 'deleted_at' exists, check if the data is soft deleted
            if (data.deleted_at) {
                // Restore the record by setting deleted_at to null
                await Model.update({ deleted_at: null }, { where });
                // await ActivityLog.create({
                //     template_id: tableData.template_id,
                //     table_row_id: data.id,
                //     user_id: actorId,
                //     activity: `Restored`,
                // });
                return userSendResponse(
                    res,
                    200,
                    true,
                    `Data from table ${table_name} restored successfully.`,
                    null
                );
            } else {
                // Soft delete (set deleted_at timestamp)
                await Model.update({ deleted_at: new Date() }, { where });
                // await ActivityLog.create({
                //     template_id: tableData.template_id,
                //     table_row_id: data.id,
                //     user_id: actorId,
                //     actor_name: actorName,
                //     activity: `Deleted`,
                // });
                return userSendResponse(
                    res,
                    200,
                    true,
                    `Data from table ${table_name} soft deleted successfully.`,
                    null
                );
            }
        } else {
            // Hard delete if 'deleted_at' does not exist
            await Model.destroy({ where });

            // Delete corresponding entries from related tables
            // await ProfileAttachment.destroy({
            //     where: {
            //         template_id: tableData.template_id,
            //         table_row_id: data.id,
            //     },
            // });

            // await ActivityLog.destroy({
            //     where: {
            //         template_id: tableData.template_id,
            //         table_row_id: data.id,
            //     },
            // });

            // await ProfileHistory.destroy({
            //     where: {
            //         template_id: tableData.template_id,
            //         table_row_id: data.id,
            //     },

            // });

            // await TemplateUserStatus.destroy({
            //     where: {
            //         template_id: tableData.template_id,
            //         table_row_id: data.id,
            //     },
            // });
            return userSendResponse(
                res,
                200,
                true,
                `Data from table ${table_name} deleted successfully.`,
                null
            );
        }
    } catch (error) {
        console.error("Error deleting data:", error.message);
        return userSendResponse(res, 500, false, "Server error.", error.message);
    }
};

exports.paginateTemplateData = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 5,
            sort_by = 'template_id',
            order = 'ASC',
            search = '',
            search_field = '',
            table_name,
            is_starred = false,
            is_read = '',

        } = req.body;
        const { filter = {}, from_date = null, to_date = null } = req.body;
        const userId = res.locals.user_id || null;

        if (!table_name) {
            return userSendResponse(res, 400, false, "Table name is required.", null);
        }

        const tableTemplate = await Template.findOne({ where: { table_name } });
        if (!tableTemplate) {
            return userSendResponse(res, 404, false, `Table ${table_name} does not exist.`, null);
        }

        let fieldsArray;
        try {
            fieldsArray = typeof tableTemplate.fields === 'string' ? JSON.parse(tableTemplate.fields) : tableTemplate.fields;
        } catch (err) {
            console.error("Error parsing fields:", err);
            return userSendResponse(res, 500, false, "Invalid table schema format.", null);
        }

        if (!Array.isArray(fieldsArray)) {
            return userSendResponse(res, 500, false, "Fields must be an array in the table schema.", null);
        }

        const fields = {};
        const associations = [];
        const radioFieldMappings = {};
        const checkboxFieldMappings = {};
        const dropdownFieldMappings = {};

        // Store field configurations by name for easy lookup
        const fieldConfigs = {};

        for (const field of fieldsArray) {
            const {
                name: columnName,
                data_type,
                max_length,
                not_null,
                default_value,
                table,
                forign_key,
                attributes,
                options,
                type,
                table_display_content
            } = field;

            if (!table_display_content) continue; // Filter out fields not marked for display

            // Store the complete field configuration for reference
            fieldConfigs[columnName] = field;

            const sequelizeType = data_type?.toUpperCase() === 'VARCHAR' && max_length
                ? Sequelize.DataTypes.STRING(max_length)
                : Sequelize.DataTypes[data_type?.toUpperCase()] || Sequelize.DataTypes.STRING;

            fields[columnName] = {
                type: sequelizeType,
                allowNull: !not_null,
                defaultValue: default_value || null,
                displayContent: table_display_content,
            };

            if (type === 'radio' && Array.isArray(options)) {
                radioFieldMappings[columnName] = options.reduce((acc, option) => {
                    acc[option.code] = option.name;
                    return acc;
                }, {});
            }

            if (type === 'checkbox' && Array.isArray(options)) {
                checkboxFieldMappings[columnName] = options.reduce((acc, option) => {
                    acc[option.code] = option.name;
                    return acc;
                }, {});
            }

            if ((type === 'dropdown' || type === 'multidropdown' || type === 'autocomplete') && Array.isArray(options)) {
                dropdownFieldMappings[columnName] = options.reduce((acc, option) => {
                    acc[option.code] = option.name;
                    return acc;
                }, {});
            }

            if (table && forign_key && attributes) {
                associations.push({
                    relatedTable: table,
                    foreignKey: columnName,
                    targetAttribute: attributes,
                });
            }
        }

        const DynamicTable = sequelize.define(table_name, fields, {
            freezeTableName: true,
            timestamps: true,
        });

        const include = [];
        for (const association of associations) {
            const RelatedModel = require(`../models`)[association.relatedTable];
            if (RelatedModel) {
                DynamicTable.belongsTo(RelatedModel, {
                    foreignKey: association.foreignKey,
                    as: `${association.relatedTable}Details`,
                });

                include.push({
                    model: RelatedModel,
                    as: `${association.relatedTable}Details`,
                    attributes: association.targetAttribute || { exclude: ['created_date', 'modified_date'] },
                });
            }
        }

        // // Add TemplateStar association
        // DynamicTable.hasOne(db.TemplateStar, {
        //     foreignKey: 'table_row_id',
        //     sourceKey: 'id',
        //     as: 'Starred',
        //     constraints: false,
        // });

        // // Add TemplateUserStatus association
        // DynamicTable.hasOne(db.TemplateUserStatus, {
        //     foreignKey: 'table_row_id',
        //     sourceKey: 'id',
        //     as: 'ReadStatus',
        //     constraints: false,
        // });

        // include.push({
        //     model: db.TemplateStar,
        //     as: 'Starred',
        //     required: is_starred,  // Only include if filtering by starred
        //     where: {
        //         user_id: userId,
        //         template_id: tableTemplate.template_id
        //     },
        //     attributes: ['template_star_id']
        // });

        // include.push({
        //     model: db.TemplateUserStatus,
        //     as: 'ReadStatus',
        //     required: is_read,
        //     where: {
        //         user_id: userId,
        //         template_id: tableTemplate.template_id
        //     },
        //     attributes: ['template_user_status_id']
        // });

        const offset = (page - 1) * limit;
        const Op = Sequelize.Op;
        const whereClause = {};

        // Apply field filters if provided
        if (filter && typeof filter === 'object') {
            Object.entries(filter).forEach(([key, value]) => {
                if (fields[key]) {  // Assuming 'fields' contains the field definitions
                    whereClause[key] = value; // Direct match for foreign key fields
                }
            });
        }

        // Apply date range filter if provided
        // if (from_date || to_date) {
        //     whereClause["created_at"] = {};
        //     if (from_date) {
        //         whereClause["created_at"][Op.gte] = new Date(from_date);
        //     }
        //     if (to_date) {
        //         whereClause["created_at"][Op.lte] = new Date(to_date);
        //     }
        // }
        if (from_date || to_date) {
            whereClause["created_at"] = {};

            if (from_date) {
                whereClause["created_at"][Op.gte] = new Date(`${from_date}T00:00:00.000Z`);
            }
            if (to_date) {
                whereClause["created_at"][Op.lte] = new Date(`${to_date}T23:59:59.999Z`);
            }
        }

        if (is_read === false) {
            whereClause["$ReadStatus.template_user_status_id$"] = { [Op.is]: null }; // Filter only unread records
        }

        if (search) {
            const searchConditions = [];

            if (search_field && fields[search_field]) {
                // Specific field search
                const fieldConfig = fieldConfigs[search_field];
                const fieldType = fields[search_field].type.key;
                const isForeignKey = associations.some(assoc => assoc.foreignKey === search_field);

                // Handle field type based search
                if (["STRING", "TEXT"].includes(fieldType)) {
                    searchConditions.push({ [search_field]: { [Op.iLike]: `%${search}%` } });
                } else if (["INTEGER", "FLOAT", "DOUBLE"].includes(fieldType)) {
                    if (!isNaN(search)) {
                        searchConditions.push({ [search_field]: parseInt(search, 10) });
                    }
                } else if (fieldType === "BOOLEAN") {
                    const boolValue = search.toLowerCase() === "true";
                    searchConditions.push({ [search_field]: boolValue });
                } else if (fieldType === "DATE") {
                    const parsedDate = Date.parse(search);
                    if (!isNaN(parsedDate)) {
                        searchConditions.push({ [search_field]: new Date(parsedDate) });
                    }
                }

                // Handle dropdown, radio, checkbox special searches
                if (fieldConfig && fieldConfig.type === 'dropdown' && Array.isArray(fieldConfig.options)) {
                    // Find option code that matches the search text
                    const matchingOption = fieldConfig.options.find(option =>
                        option.name.toLowerCase().includes(search.toLowerCase())
                    );

                    if (matchingOption) {
                        searchConditions.push({ [search_field]: matchingOption.code });
                    }
                }

                if (fieldConfig && fieldConfig.type === 'radio' && Array.isArray(fieldConfig.options)) {
                    // Find option code that matches the search text
                    const matchingOption = fieldConfig.options.find(option =>
                        option.name.toLowerCase().includes(search.toLowerCase())
                    );

                    if (matchingOption) {
                        searchConditions.push({ [search_field]: matchingOption.code });
                    }
                }

                // Handle foreign keys
                if (isForeignKey) {
                    const association = associations.find(assoc => assoc.foreignKey === search_field);
                    if (association) {
                        // Get the included model from the include array
                        const associatedModel = include.find(inc => inc.as === `${association.relatedTable}Details`);

                        // Only add the condition if the model is properly included
                        if (associatedModel) {
                            searchConditions.push({
                                [`$${association.relatedTable}Details.${association.targetAttribute}$`]: { [Op.iLike]: `%${search}%` }
                            });
                        }
                    }
                }
            } else {
                // General search across all fields
                Object.keys(fields).forEach((field) => {
                    const fieldConfig = fieldConfigs[field];
                    const fieldType = fields[field].type.key;
                    const isForeignKey = associations.some(assoc => assoc.foreignKey === field);

                    // Standard text and numeric search
                    if (["STRING", "TEXT"].includes(fieldType)) {
                        searchConditions.push({ [field]: { [Op.iLike]: `%${search}%` } });
                    } else if (["INTEGER", "FLOAT", "DOUBLE"].includes(fieldType)) {
                        if (!isNaN(search)) {
                            searchConditions.push({ [field]: parseInt(search, 10) });
                        }
                    }

                    // Dropdown, radio, checkbox search
                    if (fieldConfig && fieldConfig.type === 'dropdown' && Array.isArray(fieldConfig.options)) {
                        // Find option code that matches the search text
                        const matchingOption = fieldConfig.options.find(option =>
                            option.name.toLowerCase().includes(search.toLowerCase())
                        );

                        if (matchingOption) {
                            searchConditions.push({ [field]: matchingOption.code });
                        }
                    }

                    if (fieldConfig && fieldConfig.type === 'radio' && Array.isArray(fieldConfig.options)) {
                        // Find option code that matches the search text
                        const matchingOption = fieldConfig.options.find(option =>
                            option.name.toLowerCase().includes(search.toLowerCase())
                        );

                        if (matchingOption) {
                            searchConditions.push({ [field]: matchingOption.code });
                        }
                    }

                    // Foreign key search
                    if (isForeignKey) {
                        const association = associations.find(assoc => assoc.foreignKey === field);
                        if (association) {
                            // Get the included model from the include array
                            const associatedModel = include.find(inc => inc.as === `${association.relatedTable}Details`);

                            // Only add the condition if the model is properly included
                            if (associatedModel) {
                                searchConditions.push({
                                    [`$${association.relatedTable}Details.${association.targetAttribute}$`]: { [Op.iLike]: `%${search}%` }
                                });
                            }
                        }
                    }
                });
            }

            if (searchConditions.length > 0) {
                whereClause[Op.or] = searchConditions;
            }
        }

        const validSortBy = fields[sort_by] ? sort_by : 'id';

        const result = await DynamicTable.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [[validSortBy, order.toUpperCase()]],
            attributes: ['id', ...Object.keys(fields).filter(field => fields[field].displayContent)],
            include,
        });

        const totalItems = result.count;
        const totalPages = Math.ceil(totalItems / limit);

        const transformedRows = await Promise.all(
            result.rows.map(async (record) => {
                const data = record.toJSON();

                // Map radio, checkbox, and dropdown fields to display values
                for (const fieldName in radioFieldMappings) {
                    if (data[fieldName] !== undefined && radioFieldMappings[fieldName][data[fieldName]]) {
                        data[fieldName] = radioFieldMappings[fieldName][data[fieldName]];
                    }
                }
                for (const fieldName in checkboxFieldMappings) {
                    if (data[fieldName]) {
                        const codes = data[fieldName].split(',').map(code => code.trim());
                        data[fieldName] = codes.map(code => checkboxFieldMappings[fieldName][code] || code).join(', ');
                    }
                }
                for (const fieldName in dropdownFieldMappings) {
                    if (data[fieldName] !== undefined && dropdownFieldMappings[fieldName][data[fieldName]]) {
                        data[fieldName] = dropdownFieldMappings[fieldName][data[fieldName]];
                    }
                }

                // Fetch attachments related to this row
                // const attachments = await ProfileAttachment.findAll({
                //     where: {
                //         template_id: tableTemplate.template_id,
                //         table_row_id: data.id,
                //     },
                //     order: [['created_at', 'DESC']]
                // });

                // if (attachments.length) {
                //     data.attachments = attachments.map(att => att.toJSON());
                // }

                // data.ReadStatus = data.ReadStatus ? true : false;
                // Handle alias mappings before processing associations
                // for (const association of associations) {
                //     const alias = `${association.relatedTable}Details`;
                //     if (data[alias]) {
                //         Object.entries(data[alias]).forEach(([key, value]) => {
                //             data[association.foreignKey] = value;
                //         });
                //         delete data[alias]; // Remove unnecessary alias object from response
                //     }
                // }

                // Fetch linked profile info manually
                const linkedProfileInfo = [];

                // for (const association of associations) {
                //     const foreignKeyValue = data[association.foreignKey];

                //     if (foreignKeyValue) {
                //         try {
                //             // Fetch associated table metadata from the Template model
                //             const associatedTemplate = await Template.findOne({
                //                 where: {
                //                     table_name: association.relatedTable,  // Ensure the correct table name
                //                 },
                //                 attributes: ['template_type'],
                //             });

                //             // Check if the table name starts with "da" and template_type is not "master"
                //             if (associatedTemplate && association.relatedTable.startsWith("da") && associatedTemplate.template_type !== "master") {
                //                 const [linkedRow] = await sequelize.query(
                //                     `SELECT id FROM ${association.relatedTable} WHERE ${association.targetAttribute} = :foreignKeyValue LIMIT 1`,
                //                     {
                //                         replacements: { foreignKeyValue },
                //                         type: Sequelize.QueryTypes.SELECT
                //                     }
                //                 );

                //                 if (linkedRow && linkedRow.id) {
                //                     linkedProfileInfo.push({
                //                         table: association.relatedTable,
                //                         id: linkedRow.id,
                //                         field: association.foreignKey
                //                     });
                //                 }
                //             }
                //         } catch (error) {
                //             console.error(`Error fetching linked profile info for ${association.relatedTable}:`, error);
                //         }
                //     }
                // }

                // Add linked profile info to the response
                // data.linked_profile_info = linkedProfileInfo.length ? linkedProfileInfo : null;

                return data;
            })
        );

        const responseData = {
            // data: transformedRows,
            data: transformedRows.map(row => ({ ...row, created_by: tableTemplate.created_by })),
            columns: [
                ...fieldsArray.map(field => ({
                    name: field.name
                })),
                // Manually adding created_at and updated_at timestamps
                {
                    name: "created_at",
                },
                {
                    name: "updated_at",
                }
            ],

            meta: {
                page,
                limit,
                totalItems,
                totalPages,
                sort_by: validSortBy,
                order,
            },
        };

        return userSendResponse(res, 200, true, "Data fetched successfully", responseData);
    } catch (error) {
        console.error('Error fetching paginated data:', error);
        return userSendResponse(res, 500, false, "Server error", error);
    }
};
// //////////////////////////////////////////////////////////without searching dependency dropdown
// exports.paginateTemplateData = async (req, res) => {
//     try {
//         const {
//             page = 1,
//             limit = 5,
//             sort_by = 'template_id',
//             order = 'ASC',
//             search = '',
//             search_field = '',

//             table_name,
//             is_starred = false,
//             is_read = '',
//         } = req.body;
//         const userId = res.locals.user_id || null;

//         if (!table_name) {
//             return userSendResponse(res, 400, false, "Table name is required.", null);
//         }

//         const tableTemplate = await Template.findOne({ where: { table_name } });
//         if (!tableTemplate) {
//             return userSendResponse(res, 404, false, `Table ${table_name} does not exist.`, null);
//         }

//         let fieldsArray;
//         try {
//             fieldsArray = typeof tableTemplate.fields === 'string' ? JSON.parse(tableTemplate.fields) : tableTemplate.fields;
//         } catch (err) {
//             console.error("Error parsing fields:", err);
//             return userSendResponse(res, 500, false, "Invalid table schema format.", null);
//         }

//         if (!Array.isArray(fieldsArray)) {
//             return userSendResponse(res, 500, false, "Fields must be an array in the table schema.", null);
//         }

//         const fields = {};
//         const associations = [];
//         const radioFieldMappings = {};
//         const checkboxFieldMappings = {};
//         const dropdownFieldMappings = {};

//         for (const field of fieldsArray) {
//             const {
//                 name: columnName,
//                 data_type,
//                 max_length,
//                 not_null,
//                 default_value,
//                 table,
//                 forign_key,
//                 attributes,
//                 options,
//                 type,
//                 table_display_content
//             } = field;

//             if (!table_display_content) continue; // Filter out fields not marked for display

//             const sequelizeType = data_type?.toUpperCase() === 'VARCHAR' && max_length
//                 ? Sequelize.DataTypes.STRING(max_length)
//                 : Sequelize.DataTypes[data_type?.toUpperCase()] || Sequelize.DataTypes.STRING;

//             fields[columnName] = {
//                 type: sequelizeType,
//                 allowNull: !not_null,
//                 defaultValue: default_value || null,
//                 displayContent: table_display_content,
//             };

//             if (type === 'radio' && Array.isArray(options)) {
//                 radioFieldMappings[columnName] = options.reduce((acc, option) => {
//                     acc[option.code] = option.name;
//                     return acc;
//                 }, {});
//             }

//             if (type === 'checkbox' && Array.isArray(options)) {
//                 checkboxFieldMappings[columnName] = options.reduce((acc, option) => {
//                     acc[option.code] = option.name;
//                     return acc;
//                 }, {});
//             }

//             if (type === 'dropdown' && Array.isArray(options)) {
//                 dropdownFieldMappings[columnName] = options.reduce((acc, option) => {
//                     acc[option.code] = option.name;
//                     return acc;
//                 }, {});
//             }

//             if (table && forign_key && attributes) {
//                 associations.push({
//                     relatedTable: table,
//                     foreignKey: columnName,
//                     targetAttribute: attributes,
//                 });
//             }
//         }

//         const DynamicTable = sequelize.define(table_name, fields, {
//             freezeTableName: true,
//             timestamps: true,
//         });

//         const include = [];
//         for (const association of associations) {
//             const RelatedModel = require(`../models`)[association.relatedTable];
//             if (RelatedModel) {
//                 DynamicTable.belongsTo(RelatedModel, {
//                     foreignKey: association.foreignKey,
//                     as: `${association.relatedTable}Details`,
//                 });

//                 include.push({
//                     model: RelatedModel,
//                     as: `${association.relatedTable}Details`,
//                     attributes: association.targetAttribute || { exclude: ['created_date', 'modified_date'] },
//                 });
//             }
//         }


//         // Add TemplateStar association
//         DynamicTable.hasOne(db.TemplateStar, {
//             foreignKey: 'table_row_id',
//             sourceKey: 'id',
//             as: 'Starred',
//             constraints: false,
//         });

//         // Add TemplateUserStatus association
//         DynamicTable.hasOne(db.TemplateUserStatus, {
//             foreignKey: 'table_row_id',
//             sourceKey: 'id',
//             as: 'ReadStatus',
//             constraints: false,
//         });

//         include.push({
//             model: db.TemplateStar,
//             as: 'Starred',
//             required: is_starred,  // Only include if filtering by starred
//             where: {
//                 user_id: userId,
//                 template_id: tableTemplate.template_id
//             },
//             attributes: ['template_star_id']
//         });
//         include.push({
//             model: db.TemplateUserStatus,
//             as: 'ReadStatus',
//             required: is_read,
//             where: {
//                 user_id: userId,
//                 template_id: tableTemplate.template_id
//             },
//             attributes: ['template_user_status_id']
//         });
//         const offset = (page - 1) * limit;
//         const Op = Sequelize.Op;
//         const whereClause = {};

//         if (is_read === false) {
//             whereClause["$ReadStatus.template_user_status_id$"] = { [Op.is]: null }; // Filter only unread records
//         }


//         // if (search) {
//         //     const searchConditions = [];

//         //     if (search_field && fields[search_field]) {
//         //         const fieldType = fields[search_field].type.key;
//         //         const isForeignKey = associations.some(assoc => assoc.foreignKey === search_field);

//         //         if (["STRING", "TEXT"].includes(fieldType)) {
//         //             searchConditions.push({ [search_field]: { [Op.iLike]: `%${search}%` } });
//         //         } else if (["INTEGER", "FLOAT", "DOUBLE"].includes(fieldType)) {
//         //             if (!isNaN(search)) {
//         //                 searchConditions.push({ [search_field]: parseInt(search, 10) });
//         //             }
//         //         } else if (fieldType === "BOOLEAN") {
//         //             const boolValue = search.toLowerCase() === "true";
//         //             searchConditions.push({ [search_field]: boolValue });
//         //         } else if (fieldType === "DATE") {
//         //             const parsedDate = Date.parse(search);
//         //             if (!isNaN(parsedDate)) {
//         //                 searchConditions.push({ [search_field]: new Date(parsedDate) });
//         //             }
//         //         }

//         //         if (isForeignKey) {
//         //             const association = associations.find(assoc => assoc.foreignKey === search_field);
//         //             if (association) {
//         //                 searchConditions.push({
//         //                     [`$${association.relatedTable}Details.${association.targetAttribute}$`]: { [Op.iLike]: `%${search}%` }
//         //                 });
//         //             }
//         //         }
//         //     } else {
//         //         Object.keys(fields).forEach((field) => {
//         //             const fieldType = fields[field].type.key;
//         //             const isForeignKey = associations.some(assoc => assoc.foreignKey === field);

//         //             if (["STRING", "TEXT"].includes(fieldType)) {
//         //                 searchConditions.push({ [field]: { [Op.iLike]: `%${search}%` } });
//         //             } else if (["INTEGER", "FLOAT", "DOUBLE"].includes(fieldType)) {
//         //                 if (!isNaN(search)) {
//         //                     searchConditions.push({ [field]: parseInt(search, 10) });
//         //                 }
//         //             }

//         //             if (isForeignKey) {
//         //                 const association = associations.find(assoc => assoc.foreignKey === field);
//         //                 if (association) {
//         //                     searchConditions.push({
//         //                         [`$${association.relatedTable}Details.${association.targetAttribute}$`]: { [Op.iLike]: `%${search}%` }
//         //                     });
//         //                 }
//         //             }
//         //         });
//         //     }

//         //     if (searchConditions.length > 0) {
//         //         whereClause[Op.or] = searchConditions;
//         //     }
//         // }

//         if (search) {
//             const searchConditions = [];

//             if (search_field && fields[search_field]) {
//                 const fieldType = fields[search_field].type.key;
//                 const isForeignKey = associations.some(assoc => assoc.foreignKey === search_field);

//                 if (["STRING", "TEXT"].includes(fieldType)) {
//                     searchConditions.push({ [search_field]: { [Op.iLike]: `%${search}%` } });
//                 } else if (["INTEGER", "FLOAT", "DOUBLE"].includes(fieldType)) {
//                     if (!isNaN(search)) {
//                         searchConditions.push({ [search_field]: parseInt(search, 10) });
//                     }
//                 } else if (fieldType === "BOOLEAN") {
//                     const boolValue = search.toLowerCase() === "true";
//                     searchConditions.push({ [search_field]: boolValue });
//                 } else if (fieldType === "DATE") {
//                     const parsedDate = Date.parse(search);
//                     if (!isNaN(parsedDate)) {
//                         searchConditions.push({ [search_field]: new Date(parsedDate) });
//                     }
//                 }

//                 // Check for foreign key with properly loaded model
//                 if (isForeignKey) {
//                     const association = associations.find(assoc => assoc.foreignKey === search_field);
//                     if (association) {
//                         // Get the included model from the include array
//                         const associatedModel = include.find(inc => inc.as === `${association.relatedTable}Details`);

//                         // Only add the condition if the model is properly included
//                         if (associatedModel) {
//                             searchConditions.push({
//                                 [`$${association.relatedTable}Details.${association.targetAttribute}$`]: { [Op.iLike]: `%${search}%` }
//                             });
//                         }
//                     }
//                 }
//             } else {
//                 // General search across all fields
//                 Object.keys(fields).forEach((field) => {
//                     const fieldType = fields[field].type.key;
//                     const isForeignKey = associations.some(assoc => assoc.foreignKey === field);

//                     if (["STRING", "TEXT"].includes(fieldType)) {
//                         searchConditions.push({ [field]: { [Op.iLike]: `%${search}%` } });
//                     } else if (["INTEGER", "FLOAT", "DOUBLE"].includes(fieldType)) {
//                         if (!isNaN(search)) {
//                             searchConditions.push({ [field]: parseInt(search, 10) });
//                         }
//                     }

//                     // Check for foreign key with properly loaded model
//                     if (isForeignKey) {
//                         const association = associations.find(assoc => assoc.foreignKey === field);
//                         if (association) {
//                             // Get the included model from the include array
//                             const associatedModel = include.find(inc => inc.as === `${association.relatedTable}Details`);

//                             // Only add the condition if the model is properly included
//                             if (associatedModel) {
//                                 searchConditions.push({
//                                     [`$${association.relatedTable}Details.${association.targetAttribute}$`]: { [Op.iLike]: `%${search}%` }
//                                 });
//                             }
//                         }
//                     }
//                 });
//             }

//             if (searchConditions.length > 0) {
//                 whereClause[Op.or] = searchConditions;
//             }
//         }

//         const validSortBy = fields[sort_by] ? sort_by : 'id';

//         const result = await DynamicTable.findAndCountAll({
//             where: whereClause,
//             limit,
//             offset,
//             order: [[validSortBy, order.toUpperCase()]],
//             attributes: ['id', ...Object.keys(fields).filter(field => fields[field].displayContent)],
//             include,
//         });

//         const totalItems = result.count;
//         const totalPages = Math.ceil(totalItems / limit);



//         const transformedRows = await Promise.all(
//             result.rows.map(async (record) => {
//                 const data = record.toJSON();

//                 // Map radio, checkbox, and dropdown fields to display values
//                 for (const fieldName in radioFieldMappings) {
//                     if (data[fieldName] !== undefined && radioFieldMappings[fieldName][data[fieldName]]) {
//                         data[fieldName] = radioFieldMappings[fieldName][data[fieldName]];
//                     }
//                 }
//                 for (const fieldName in checkboxFieldMappings) {
//                     if (data[fieldName]) {
//                         const codes = data[fieldName].split(',').map(code => code.trim());
//                         data[fieldName] = codes.map(code => checkboxFieldMappings[fieldName][code] || code).join(', ');
//                     }
//                 }
//                 for (const fieldName in dropdownFieldMappings) {
//                     if (data[fieldName] !== undefined && dropdownFieldMappings[fieldName][data[fieldName]]) {
//                         data[fieldName] = dropdownFieldMappings[fieldName][data[fieldName]];
//                     }
//                 }

//                 // Fetch attachments related to this row
//                 const attachments = await ProfileAttachment.findAll({
//                     where: {
//                         template_id: tableTemplate.template_id,
//                         table_row_id: data.id,
//                     },
//                     order: [['created_at', 'DESC']]
//                 });

//                 if (attachments.length) {
//                     data.attachments = attachments.map(att => att.toJSON());
//                 }

//                 data.ReadStatus = data.ReadStatus ? true : false;
//                 // Handle alias mappings before processing associations
//                 for (const association of associations) {
//                     const alias = `${association.relatedTable}Details`;
//                     if (data[alias]) {
//                         Object.entries(data[alias]).forEach(([key, value]) => {
//                             data[association.foreignKey] = value;
//                         });
//                         delete data[alias]; // Remove unnecessary alias object from response
//                     }
//                 }


//                 // Fetch linked profile info manually
//                 const linkedProfileInfo = [];

//                 for (const association of associations) {
//                     const foreignKeyValue = data[association.foreignKey];

//                     if (foreignKeyValue) {
//                         try {
//                             // Fetch associated table metadata from the Template model
//                             const associatedTemplate = await Template.findOne({
//                                 where: {
//                                     table_name: association.relatedTable,  // Ensure the correct table name
//                                 },
//                                 attributes: ['template_type'],
//                             });

//                             // Check if the table name starts with "da" and template_type is not "master"
//                             if (associatedTemplate && association.relatedTable.startsWith("da") && associatedTemplate.template_type !== "master") {
//                                 const [linkedRow] = await sequelize.query(
//                                     `SELECT id FROM ${association.relatedTable} WHERE ${association.targetAttribute} = :foreignKeyValue LIMIT 1`,
//                                     {
//                                         replacements: { foreignKeyValue },
//                                         type: Sequelize.QueryTypes.SELECT
//                                     }
//                                 );

//                                 if (linkedRow && linkedRow.id) {
//                                     linkedProfileInfo.push({
//                                         table: association.relatedTable,
//                                         id: linkedRow.id,
//                                         field: association.foreignKey
//                                     });
//                                 }
//                             }
//                         } catch (error) {
//                             console.error(`Error fetching linked profile info for ${association.relatedTable}:`, error);
//                         }
//                     }
//                 }

//                 // Add linked profile info to the response
//                 data.linked_profile_info = linkedProfileInfo.length ? linkedProfileInfo : null;

//                 return data;
//             })
//         );

//         const responseData = {
//             // data: transformedRows,
//             data: transformedRows.map(row => ({ ...row, created_by: tableTemplate.created_by })),
//             columns: [
//                 ...fieldsArray.map(field => ({
//                     name: field.name

//                 })),
//                 // Manually adding created_at and updated_at timestamps
//                 {
//                     name: "created_at",

//                 },
//                 {
//                     name: "updated_at",

//                 }
//             ],

//             meta: {
//                 page,
//                 limit,
//                 totalItems,
//                 totalPages,
//                 sort_by: validSortBy,
//                 order,
//             },
//         };

//         return userSendResponse(res, 200, true, "Data fetched successfully", responseData);
//     } catch (error) {
//         console.error('Error fetching paginated data:', error);
//         return userSendResponse(res, 500, false, "Server error", error);
//     }
// };

exports.paginateTemplateDataForOtherThanMaster = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 5,
            sort_by = 'template_id',
            order = 'ASC',
            search = '',
            search_field = '',
            template_module = '',
            sys_status,
            is_starred = false,
            is_read = '',
            get_sys,

        } = req.body;
        const { filter = {}, from_date = null, to_date = null } = req.body;
        const userId = res.locals.user_id || null;
        if (!template_module) {

            return userSendResponse(res, 400, false, "Template module is required", null);

        }

        // Fetch the template using template_module to get the table_name
        const template = await Template.findOne({ where: { template_module } });
        if (!template) {
            return userSendResponse(res, 400, false, "Template not found", null);

        }

        const table_name = template.table_name;
        const template_name = template.template_name;


        if (!table_name) {
            return userSendResponse(res, 400, false, "Table name is required.", null);
        }

        const tableTemplate = await Template.findOne({ where: { table_name } });
        if (!tableTemplate) {
            return userSendResponse(res, 404, false, `Table ${table_name} does not exist.`, null);
        }

        let fieldsArray;
        try {
            fieldsArray = typeof tableTemplate.fields === 'string' ? JSON.parse(tableTemplate.fields) : tableTemplate.fields;
        } catch (err) {
            console.error("Error parsing fields:", err);
            return userSendResponse(res, 500, false, "Invalid table schema format.", null);
        }

        if (!Array.isArray(fieldsArray)) {
            return userSendResponse(res, 500, false, "Fields must be an array in the table schema.", null);
        }

        const fields = {};
        const associations = [];
        const radioFieldMappings = {};
        const checkboxFieldMappings = {};
        const dropdownFieldMappings = {};

        // Store field configurations by name for easy lookup
        const fieldConfigs = {};

        for (const field of fieldsArray) {
            const {
                name: columnName,
                data_type,
                max_length,
                not_null,
                default_value,
                table,
                forign_key,
                attributes,
                options,
                type,
                table_display_content
            } = field;

            if (!table_display_content) continue; // Filter out fields not marked for display

            // Store the complete field configuration for reference
            fieldConfigs[columnName] = field;

            const sequelizeType = data_type?.toUpperCase() === 'VARCHAR' && max_length
                ? Sequelize.DataTypes.STRING(max_length)
                : Sequelize.DataTypes[data_type?.toUpperCase()] || Sequelize.DataTypes.STRING;

            fields[columnName] = {
                type: sequelizeType,
                allowNull: !not_null,
                defaultValue: default_value || null,
                displayContent: table_display_content,
            };

            if (type === 'radio' && Array.isArray(options)) {
                radioFieldMappings[columnName] = options.reduce((acc, option) => {
                    acc[option.code] = option.name;
                    return acc;
                }, {});
            }

            if (type === 'checkbox' && Array.isArray(options)) {
                checkboxFieldMappings[columnName] = options.reduce((acc, option) => {
                    acc[option.code] = option.name;
                    return acc;
                }, {});
            }

            if ((type === 'dropdown' || type === 'multidropdown' || type === 'autocomplete') && Array.isArray(options)) {
                dropdownFieldMappings[columnName] = options.reduce((acc, option) => {
                    acc[option.code] = option.name;
                    return acc;
                }, {});
            }

            if (table && forign_key && attributes) {
                associations.push({
                    relatedTable: table,
                    foreignKey: columnName,
                    targetAttribute: attributes,
                });
            }
        }

        const DynamicTable = sequelize.define(table_name, fields, {
            freezeTableName: true,
            timestamps: true,
        });

        const include = [];
        for (const association of associations) {
            const RelatedModel = require(`../models`)[association.relatedTable];
            if (RelatedModel) {
                DynamicTable.belongsTo(RelatedModel, {
                    foreignKey: association.foreignKey,
                    as: `${association.relatedTable}Details`,
                });

                include.push({
                    model: RelatedModel,
                    as: `${association.relatedTable}Details`,
                    attributes: association.targetAttribute || { exclude: ['created_date', 'modified_date'] },
                });
            }
        }

        // // Add TemplateStar association
        // DynamicTable.hasOne(db.TemplateStar, {
        //     foreignKey: 'table_row_id',
        //     sourceKey: 'id',
        //     as: 'Starred',
        //     constraints: false,
        // });

        // // Add TemplateUserStatus association
        // DynamicTable.hasOne(db.TemplateUserStatus, {
        //     foreignKey: 'table_row_id',
        //     sourceKey: 'id',
        //     as: 'ReadStatus',
        //     constraints: false,
        // });

        // include.push({
        //     model: db.TemplateStar,
        //     as: 'Starred',
        //     required: is_starred,  // Only include if filtering by starred
        //     where: {
        //         user_id: userId,
        //         template_id: tableTemplate.template_id
        //     },
        //     attributes: ['template_star_id']
        // });

        // include.push({
        //     model: db.TemplateUserStatus,
        //     as: 'ReadStatus',
        //     required: is_read,
        //     where: {
        //         user_id: userId,
        //         template_id: tableTemplate.template_id
        //     },
        //     attributes: ['template_user_status_id']
        // });

        const offset = (page - 1) * limit;
        const Op = Sequelize.Op;
        const whereClause = {};

        // Apply field filters if provided
        if (filter && typeof filter === 'object') {
            Object.entries(filter).forEach(([key, value]) => {
                if (fields[key]) {  // Assuming 'fields' contains the field definitions
                    whereClause[key] = value; // Direct match for foreign key fields
                }
            });
        }

        // Apply date range filter if provided
        // if (from_date || to_date) {
        //     whereClause["created_at"] = {};
        //     if (from_date) {
        //         whereClause["created_at"][Op.gte] = new Date(from_date);
        //     }
        //     if (to_date) {
        //         whereClause["created_at"][Op.lte] = new Date(to_date);
        //     }
        // }
        if (from_date || to_date) {
            whereClause["created_at"] = {};

            if (from_date) {
                whereClause["created_at"][Op.gte] = new Date(`${from_date}T00:00:00.000Z`);
            }
            if (to_date) {
                whereClause["created_at"][Op.lte] = new Date(`${to_date}T23:59:59.999Z`);
            }
        }

        if (is_read === false) {
            whereClause["$ReadStatus.template_user_status_id$"] = { [Op.is]: null }; // Filter only unread records
        }

        if (search) {
            const searchConditions = [];

            if (search_field && fields[search_field]) {
                // Specific field search
                const fieldConfig = fieldConfigs[search_field];
                const fieldType = fields[search_field].type.key;
                const isForeignKey = associations.some(assoc => assoc.foreignKey === search_field);

                // Handle field type based search
                if (["STRING", "TEXT"].includes(fieldType)) {
                    searchConditions.push({ [search_field]: { [Op.iLike]: `%${search}%` } });
                } else if (["INTEGER", "FLOAT", "DOUBLE"].includes(fieldType)) {
                    if (!isNaN(search)) {
                        searchConditions.push({ [search_field]: parseInt(search, 10) });
                    }
                } else if (fieldType === "BOOLEAN") {
                    const boolValue = search.toLowerCase() === "true";
                    searchConditions.push({ [search_field]: boolValue });
                } else if (fieldType === "DATE") {
                    const parsedDate = Date.parse(search);
                    if (!isNaN(parsedDate)) {
                        searchConditions.push({ [search_field]: new Date(parsedDate) });
                    }
                }

                // Handle dropdown, radio, checkbox special searches
                if (fieldConfig && fieldConfig.type === 'dropdown' && Array.isArray(fieldConfig.options)) {
                    // Find option code that matches the search text
                    const matchingOption = fieldConfig.options.find(option =>
                        option.name.toLowerCase().includes(search.toLowerCase())
                    );

                    if (matchingOption) {
                        searchConditions.push({ [search_field]: matchingOption.code });
                    }
                }

                if (fieldConfig && fieldConfig.type === 'radio' && Array.isArray(fieldConfig.options)) {
                    // Find option code that matches the search text
                    const matchingOption = fieldConfig.options.find(option =>
                        option.name.toLowerCase().includes(search.toLowerCase())
                    );

                    if (matchingOption) {
                        searchConditions.push({ [search_field]: matchingOption.code });
                    }
                }

                // Handle foreign keys
                if (isForeignKey) {
                    const association = associations.find(assoc => assoc.foreignKey === search_field);
                    if (association) {
                        // Get the included model from the include array
                        const associatedModel = include.find(inc => inc.as === `${association.relatedTable}Details`);

                        // Only add the condition if the model is properly included
                        if (associatedModel) {
                            searchConditions.push({
                                [`$${association.relatedTable}Details.${association.targetAttribute}$`]: { [Op.iLike]: `%${search}%` }
                            });
                        }
                    }
                }
            } else {
                // General search across all fields
                Object.keys(fields).forEach((field) => {
                    const fieldConfig = fieldConfigs[field];
                    const fieldType = fields[field].type.key;
                    const isForeignKey = associations.some(assoc => assoc.foreignKey === field);

                    // Standard text and numeric search
                    if (["STRING", "TEXT"].includes(fieldType)) {
                        searchConditions.push({ [field]: { [Op.iLike]: `%${search}%` } });
                    } else if (["INTEGER", "FLOAT", "DOUBLE"].includes(fieldType)) {
                        if (!isNaN(search)) {
                            searchConditions.push({ [field]: parseInt(search, 10) });
                        }
                    }

                    // Dropdown, radio, checkbox search
                    if (fieldConfig && fieldConfig.type === 'dropdown' && Array.isArray(fieldConfig.options)) {
                        // Find option code that matches the search text
                        const matchingOption = fieldConfig.options.find(option =>
                            option.name.toLowerCase().includes(search.toLowerCase())
                        );

                        if (matchingOption) {
                            searchConditions.push({ [field]: matchingOption.code });
                        }
                    }

                    if (fieldConfig && fieldConfig.type === 'radio' && Array.isArray(fieldConfig.options)) {
                        // Find option code that matches the search text
                        const matchingOption = fieldConfig.options.find(option =>
                            option.name.toLowerCase().includes(search.toLowerCase())
                        );

                        if (matchingOption) {
                            searchConditions.push({ [field]: matchingOption.code });
                        }
                    }

                    // Foreign key search
                    if (isForeignKey) {
                        const association = associations.find(assoc => assoc.foreignKey === field);
                        if (association) {
                            // Get the included model from the include array
                            const associatedModel = include.find(inc => inc.as === `${association.relatedTable}Details`);

                            // Only add the condition if the model is properly included
                            if (associatedModel) {
                                searchConditions.push({
                                    [`$${association.relatedTable}Details.${association.targetAttribute}$`]: { [Op.iLike]: `%${search}%` }
                                });
                            }
                        }
                    }
                });
            }

            if (searchConditions.length > 0) {
                whereClause[Op.or] = searchConditions;
            }
        }

        const validSortBy = fields[sort_by] ? sort_by : 'id';

        if (sys_status !== null && sys_status !== undefined && sys_status !== "all") {
            // if (sys_status === "ui_case") {
            //     whereClause['sys_status'] = { [Op.in]: ['ui_case', 'pt_case', 'ui_to_pt'] };
            // } else {
                whereClause['sys_status'] = sys_status;
            // }
        }

        // Create base attributes array
        let attributesArray = ['id'];
        // Add sys_status only if get_sys is true
        if (get_sys) {
            attributesArray.push('sys_status');
        }
        // Add other fields from fields object
        attributesArray = [
            ...attributesArray,
            ...Object.keys(fields).filter(field => fields[field].displayContent)
        ];
        const result = await DynamicTable.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [[validSortBy, order.toUpperCase()]],
            attributes: attributesArray,
            include,
        });

        const totalItems = result.count;
        const totalPages = Math.ceil(totalItems / limit);

        const transformedRows = await Promise.all(
            result.rows.map(async (record) => {
                const data = record.toJSON();

                // Map radio, checkbox, and dropdown fields to display values
                for (const fieldName in radioFieldMappings) {
                    if (data[fieldName] !== undefined && radioFieldMappings[fieldName][data[fieldName]]) {
                        data[fieldName] = radioFieldMappings[fieldName][data[fieldName]];
                    }
                }
                for (const fieldName in checkboxFieldMappings) {
                    if (data[fieldName]) {
                        const codes = data[fieldName].split(',').map(code => code.trim());
                        data[fieldName] = codes.map(code => checkboxFieldMappings[fieldName][code] || code).join(', ');
                    }
                }
                for (const fieldName in dropdownFieldMappings) {
                    if (data[fieldName] !== undefined && dropdownFieldMappings[fieldName][data[fieldName]]) {
                        data[fieldName] = dropdownFieldMappings[fieldName][data[fieldName]];
                    }
                }

                // Fetch attachments related to this row
                // const attachments = await ProfileAttachment.findAll({
                //     where: {
                //         template_id: tableTemplate.template_id,
                //         table_row_id: data.id,
                //     },
                //     order: [['created_at', 'DESC']]
                // });

                // if (attachments.length) {
                //     data.attachments = attachments.map(att => att.toJSON());
                // }

                // data.ReadStatus = data.ReadStatus ? true : false;
                // Handle alias mappings before processing associations
                // for (const association of associations) {
                //     const alias = `${association.relatedTable}Details`;
                //     if (data[alias]) {
                //         Object.entries(data[alias]).forEach(([key, value]) => {
                //             data[association.foreignKey] = value;
                //         });
                //         delete data[alias]; // Remove unnecessary alias object from response
                //     }
                // }

                // Fetch linked profile info manually
                const linkedProfileInfo = [];

                // for (const association of associations) {
                //     const foreignKeyValue = data[association.foreignKey];

                //     if (foreignKeyValue) {
                //         try {
                //             // Fetch associated table metadata from the Template model
                //             const associatedTemplate = await Template.findOne({
                //                 where: {
                //                     table_name: association.relatedTable,  // Ensure the correct table name
                //                 },
                //                 attributes: ['template_type'],
                //             });

                //             // Check if the table name starts with "da" and template_type is not "master"
                //             if (associatedTemplate && association.relatedTable.startsWith("da") && associatedTemplate.template_type !== "master") {
                //                 const [linkedRow] = await sequelize.query(
                //                     `SELECT id FROM ${association.relatedTable} WHERE ${association.targetAttribute} = :foreignKeyValue LIMIT 1`,
                //                     {
                //                         replacements: { foreignKeyValue },
                //                         type: Sequelize.QueryTypes.SELECT
                //                     }
                //                 );

                //                 if (linkedRow && linkedRow.id) {
                //                     linkedProfileInfo.push({
                //                         table: association.relatedTable,
                //                         id: linkedRow.id,
                //                         field: association.foreignKey
                //                     });
                //                 }
                //             }
                //         } catch (error) {
                //             console.error(`Error fetching linked profile info for ${association.relatedTable}:`, error);
                //         }
                //     }
                // }

                // Add linked profile info to the response
                // data.linked_profile_info = linkedProfileInfo.length ? linkedProfileInfo : null;

                return data;
            })
        );

        const responseData = {
            // data: transformedRows,
            data: transformedRows.map(row => ({ ...row, created_by: tableTemplate.created_by })),
            columns: [
                ...fieldsArray.map(field => ({
                    name: field.name
                })),
                // Manually adding created_at and updated_at timestamps
                {
                    name: "created_at",
                },
                {
                    name: "updated_at",
                }
            ],

            meta: {
                page,
                limit,
                table_name,
                template_name,
                totalItems,
                totalPages,
                sort_by: validSortBy,
                order,
            },
        };

        return userSendResponse(res, 200, true, "Data fetched successfully", responseData);
    } catch (error) {
        console.error('Error fetching paginated data:', error);
        return userSendResponse(res, 500, false, "Server error", error);
    }
};


exports.downloadExcelData = async (req, res) => {
    const { table_name, fields } = req.body;
    const userId = res.locals.user_id || null;
    const adminUserId = res.locals.admin_user_id || null;
    const actorId = userId || adminUserId;

    if (!actorId) {
        return userSendResponse(res, 403, false, "Unauthorized access.", null);
    }

    try {
        const tableData = await Template.findOne({ where: { table_name } });
        if (!tableData) {
            return res.status(404).send(`Table ${table_name} does not exist.`);
        }

        let schema = typeof tableData.fields === "string" ? JSON.parse(tableData.fields) : tableData.fields;

        schema.push(
            { name: 'created_at', label: 'Created At', data_type: 'DATE', not_null: false },
            { name: 'updated_at', label: 'Updated At', data_type: 'DATE', not_null: false }
        );

        if (fields && Array.isArray(fields) && fields.length > 0) {
            schema = schema.filter(field => fields.includes(field.name));
        }

        const modelAttributes = {};
        const associations = [];
        const dropdownMappings = {};

        schema.forEach(({ name, data_type, not_null, table, forign_key, attributes, type, options }) => {
            modelAttributes[name] = {
                type: Sequelize.DataTypes[data_type.toUpperCase()] || Sequelize.DataTypes.STRING,
                allowNull: !not_null,
            };

            if (table && forign_key && attributes) {
                associations.push({
                    relatedTable: table,
                    foreignKey: name,
                    targetAttributes: attributes,
                });
            }

            if (type === 'dropdown' && Array.isArray(options)) {
                dropdownMappings[name] = options.reduce((acc, option) => {
                    acc[option.code] = option.name;
                    return acc;
                }, {});
            }
        });

        const Model = sequelize.define(table_name, modelAttributes, {
            freezeTableName: true,
            timestamps: true,
            paranoid: false,
            underscored: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        });
        await Model.sync();

        const include = associations.map(({ relatedTable, foreignKey, targetAttributes }) => {
            const RelatedModel = require(`../models`)[relatedTable];
            if (RelatedModel) {
                Model.belongsTo(RelatedModel, {
                    foreignKey,
                    as: `${relatedTable}Details`,
                });

                return {
                    model: RelatedModel,
                    as: `${relatedTable}Details`,
                    attributes: targetAttributes || { exclude: ['created_date', 'modified_date'] },
                };
            }
        }).filter(Boolean);

        const columnNames = schema.map(field => field.name);

        const records = await Model.findAll({
            attributes: columnNames,
            include,
            raw: true,
            nest: true,
        });

        const transformedRows = records.map(record => {
            const data = { ...record };

            for (const association of associations) {
                const alias = `${association.relatedTable}Details`;
                if (data[alias]) {
                    Object.entries(data[alias]).forEach(([key, value]) => {
                        data[association.foreignKey] = value;
                        delete data[alias];
                    });
                }
            }

            for (const field in dropdownMappings) {
                if (data[field] !== undefined && dropdownMappings[field][data[field]]) {
                    data[field] = dropdownMappings[field][data[field]];
                }
            }

            return data;
        });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');

        worksheet.columns = schema.map(field => ({
            header: field.label || field.name,
            key: field.name,
            width: 20,
        }));
        transformedRows.forEach(record => worksheet.addRow(record));

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${table_name}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error("Error during Excel download:", error);
        return res.status(500).send("An error occurred while generating the Excel file.");
    }
};




exports.fetchAndDownloadExcel = async (req, res) => {
    const { file_name } = req.body;

    try {
        // Check if file_name is provided
        if (!file_name) {
            return userSendResponse(res, 400, false, 'File name is required.', null);
        }

        // Construct the full file path
        const filePath = path.join(UPLOADS_FOLDER, file_name);

        // Check if the file exists
        if (!fs.existsSync(filePath)) {
            return userSendResponse(res, 404, false, `File ${file_name} does not exist.`, null);
        }

        // Set headers for downloading the file
        res.setHeader('Content-Disposition', `attachment; filename=${file_name}`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        // Create a read stream and pipe it to the response
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

        // Log the success
        console.log(`File ${file_name} is being downloaded.`);
    } catch (error) {
        console.error('Error fetching and downloading Excel file:', error);
        return userSendResponse(res, 500, false, 'Server error occurred while downloading the file.', error);
    }
};


const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { Readable } = require('stream');

// AWS S3 Configuration
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    ...(process.env.S3_ENDPOINT && {
        endpoint: process.env.S3_ENDPOINT,
        forcePathStyle: true,
    }),
});

exports.downloadDocumentAttachments = async (req, res) => {
    try {
        const profile_attachment = await ProfileAttachment.findOne({
            where: { profile_attachment_id: req.params.profile_attachment_id },
        });

        if (!profile_attachment) {
            return userSendResponse(res, 404, false, `File does not exist.`, null);
        }

        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: profile_attachment.s3_key
        };

        const command = new GetObjectCommand(params);
        const data = await s3Client.send(command);

        // Convert stream to buffer
        const streamToBuffer = async (stream) => {
            const chunks = [];
            for await (let chunk of stream) {
                chunks.push(chunk);
            }
            return Buffer.concat(chunks);
        };

        const fileBuffer = await streamToBuffer(data.Body);

        res.setHeader('Content-Type', data.ContentType || 'application/octet-stream');
        res.setHeader('Content-Disposition', `inline; filename="${profile_attachment.attachment_name}"`);
        res.send(fileBuffer);
    } catch (err) {
        if (process.env.APP_ENV === "development") {
            console.error(`[${moment().format("DD/MM/YYYY hh:mm:ss a")}]`, err.stack || err.message);
            const url = `Location of Error: ${req.originalUrl} Method: ${req.method} Request Body: ${JSON.stringify(req.body)}`;
            console.error(url);
        }
        return userSendResponse(res, 404, false, `File does not exist.`, null);
    }
};


exports.getEventsByOrganization = async (req, res) => {
    const { organization_id, page = 1, per_page = 10, filed_name = 'modified_date', order_by = 'ASC' } = req.body;

    if (!organization_id) {
        return userSendResponse(res, 400, false, "organization_id is required", null);
    }

    try {
        // Explicitly reference the table for orderBy
        const orderBy = Sequelize.literal(`"event"."${filed_name}" ${order_by}`); // Assuming 'event' table's modified_date
        const offset = (page - 1) * per_page;

        // Fetch event IDs associated with the organization
        const eventTagData = await event_tag_organization.findAll({
            attributes: ['event_id'],
            where: { organization_id, is_active: true },
        });

        if (!eventTagData.length) {
            return userSendResponse(res, 404, false, "No events found for this organization.", null);
        }

        const eventIds = eventTagData.map(tag => tag.event_id);

        // Fetch events with event summaries and apply pagination
        const { count, rows: events } = await event.findAndCountAll({
            attributes: ['event_id', 'source_of_message', 'subject', 'description'],
            where: {
                event_id: { [Sequelize.Op.in]: eventIds }
            },
            include: [
                {
                    model: event_summary,
                    attributes: ['summary'],
                    required: false // Optional; some events might not have a summary
                }
            ],
            order: [orderBy],
            offset,
            limit: per_page
        });

        if (!events.length) {
            return userSendResponse(res, 404, false, "No matching events found.", null);
        }

        const totalPages = Math.ceil(count / per_page);
        const response = {
            current_page: page,
            per_page,
            total_records: count,
            total_pages: totalPages,
            events: events.map(event => ({
                event_id: event.event_id,
                source_of_message: event.source_of_message,
                subject: event.subject,
                description: event.description,
                event_summary: event.event_summary?.summary || null // Include event summary if available
            }))
        };

        return userSendResponse(res, 200, true, "Events fetched successfully", response);

    } catch (error) {
        console.error("Error fetching events:", error);
        return userSendResponse(res, 500, false, "Server error.", error);
    }
};




exports.getEventsByLeader = async (req, res) => {
    const { leader_id, page = 1, per_page = 10, filed_name = 'modified_date', order_by = 'ASC' } = req.body;

    if (!leader_id) {
        return userSendResponse(res, 400, false, "leader_id is required", null);
    }

    try {
        // Explicitly reference the table for orderBy
        const orderBy = Sequelize.literal(`"event"."${filed_name}" ${order_by}`); // Assuming 'event' table's modified_date
        const offset = (page - 1) * per_page;

        // Fetch event IDs associated with the leader
        const eventTagData = await event_tag_leader.findAll({
            attributes: ['event_id'],
            where: { leader_id, is_active: true },
        });

        if (!eventTagData.length) {
            return userSendResponse(res, 404, false, "No events found for this leader.", null);
        }

        const eventIds = eventTagData.map(tag => tag.event_id);

        // Fetch events with event summaries and apply pagination
        const { count, rows: events } = await event.findAndCountAll({
            attributes: ['event_id', 'source_of_message', 'subject', 'description'],
            where: {
                event_id: { [Sequelize.Op.in]: eventIds }
            },
            include: [
                {
                    model: event_summary,
                    attributes: ['summary'],
                    required: false // Optional; some events might not have a summary
                }
            ],
            order: [orderBy],
            offset,
            limit: per_page
        });

        if (!events.length) {
            return userSendResponse(res, 404, false, "No matching events found.", null);
        }

        const totalPages = Math.ceil(count / per_page);
        const response = {
            current_page: page,
            per_page,
            total_records: count,
            total_pages: totalPages,
            events: events.map(event => ({
                event_id: event.event_id,
                source_of_message: event.source_of_message,
                subject: event.subject,
                description: event.description,
                event_summary: event.event_summary?.summary || null
            }))
        };

        return userSendResponse(res, 200, true, "Events fetched successfully", response);

    } catch (error) {
        console.error("Error fetching events:", error);
        return userSendResponse(res, 500, false, "Server error.", error);
    }
};

exports.templateDataFieldDuplicateCheck = async (req, res) => {
    const { table_name, data } = req.body;

    try {
        // Fetch the table template
        const tableData = await Template.findOne({ where: { table_name } });

        if (!tableData) {
            return userSendResponse(res, 400, false, `Table ${table_name} does not exist.`, null);
        }

        // Parse schema and request data
        const schema = typeof tableData.fields === "string" ? JSON.parse(tableData.fields) : tableData.fields;
        const validData = {};

        const parsedData = data;
        const invalidFields = []; 

        // Loop through the parsedData to check if the requested data is correct
        for (const key in parsedData) {
            if (parsedData.hasOwnProperty(key)) {
                // Check if the key exists in the schema
                const field = schema.find(field => field.name === key); // Find the field in the schema

                if (field) {
                    // If the field is found in the schema, validate it
                    const { not_null } = field;

                    // Check for not null constraint
                    if (not_null && (parsedData[key] === null || parsedData[key] === '')) {
                        invalidFields.push(key);
                    } else {
                        validData[key] = parsedData[key]; 
                    }
                } else {
                    invalidFields.push(key); 
                }
            }
        }

        if (invalidFields.length > 0) {
            return userSendResponse(res, 400, false, `Invalid fields: ${invalidFields.join(', ')}`, parsedData);
        }


        // Define Sequelize model dynamically
        const modelAttributes = {};
        for (const field of schema) {
            const { name, data_type, not_null, default_value } = field;
            const sequelizeType = typeMapping[data_type.toUpperCase()] || Sequelize.DataTypes.STRING;
            modelAttributes[name] = {
                type: sequelizeType,
                allowNull: !not_null,
                defaultValue: default_value || null,
            };
        }

        const Model = sequelize.define(table_name, modelAttributes, {
            freezeTableName: true,
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        });

        // Check for duplicates
        const conditions = {};
        for (const [key, value] of Object.entries(validData)) {
            // conditions[key] = typeof value === 'string' ? { [Op.iLike]: `%${value}%` } : value; 
            conditions[key] = typeof value === 'string' ? { [Op.like]: `%${value}%` } : value; 
        }

        const existingRecords = await Model.findAll({ 
            where: conditions
        });

        if (existingRecords.length > 0) {
            return userSendResponse(res, 200, false, "Duplicate values found.");
        }

        return userSendResponse(res, 200, true, "No duplicates found.", null);
    } catch (error) {
        console.error("Error checking duplicate values in fields:", error);
        return userSendResponse(res, 500, false, "Internal Server error.", error);
    }
};

exports.checkPdfEntry = async (req, res) => {
    const { is_pdf, ui_case_id } = req.body;

    try {
        if (!ui_case_id) {
            return userSendResponse(res, 400, false, "ui_case_id is required.", null);
        }

        // Check if ui_case_id exists in the table
        const caseExists = await UiProgressReportFileStatus.findOne({
            where: { ui_case_id }
        });

        console.log("caseExists",caseExists)
        if (!caseExists) {
            return userSendResponse(res, 404, false, "Case ID not found in database.", null);
        }

        // Check if the PDF entry exists for this case ID
        const existingEntry = await UiProgressReportFileStatus.findOne({
            where: { is_pdf, ui_case_id }
        });

        console.log("existingEntry",existingEntry)

        if (existingEntry) {
            return userSendResponse(res, 200, true, "Entry found.", existingEntry);
        } else {
            return userSendResponse(res, 200, true, "No entry found.", null);
        }
    } catch (error) {
        console.error("Error checking PDF entry:", error);
        return userSendResponse(res, 500, false, "Internal Server Error.", error);
    }
};

// Cache for dynamically generated models
const modelCache = {};

exports.caseSysStatusUpdation = async (req, res) => {
    try {
        const { table_name, data } = req.body;
        if (!table_name || !data || typeof data !== "object") {
            return userSendResponse(res, 400, false, "Invalid request format.");
        }

        // Extract id and sys_status
        const { id, sys_status, default_status } = data;
        if (!id || !sys_status) {
            return userSendResponse(res, 400, false, "ID and sys_status are required.");
        }

        // Ensure id is an integer
        const recordId = parseInt(id, 10);
        if (isNaN(recordId)) {
            return userSendResponse(res, 400, false, "Invalid ID format.");
        }

        // Fetch table schema
        const tableData = await Template.findOne({ where: { table_name } });
        if (!tableData) {
            return userSendResponse(res, 400, false, `Table ${table_name} does not exist.`);
        }

        // Parse schema
        const schema = typeof tableData.fields === "string" ? JSON.parse(tableData.fields) : tableData.fields;

        // Include ID and sys_status in schema
        const completeSchema = [
            { name: "id", data_type: "INTEGER", not_null: true, primaryKey: true, autoIncrement: true },
            { name: "sys_status", data_type: "TEXT", not_null: false , default_value: default_status },
            ...schema
        ];

        // Check if model already exists in cache
        let Model = modelCache[table_name];

        if (!Model) {
            const modelAttributes = {};
            for (const field of completeSchema) {
                const { name, data_type, not_null, default_value, primaryKey, autoIncrement } = field;
                const sequelizeType = typeMapping?.[data_type.toUpperCase()] || Sequelize.DataTypes.STRING;

                modelAttributes[name] = {
                    type: sequelizeType,
                    allowNull: !not_null,
                    defaultValue: default_value || null,
                };

                if (primaryKey) modelAttributes[name].primaryKey = true;
                if (autoIncrement) modelAttributes[name].autoIncrement = true;
            }

            // Define the model once and store it in the cache
            Model = sequelize.define(
                table_name,
                {
                    ...modelAttributes,
                },
                {
                    freezeTableName: true,
                    timestamps: true,
                    createdAt: "created_at",
                    updatedAt: "updated_at",
                    underscored: true,
                }
            );

            await Model.sync({ alter: true });

            // Cache the model
            modelCache[table_name] = Model;
        }

        // Find existing record
        const record = await Model.findByPk(recordId);
        if (!record) {
            return userSendResponse(res, 404, false, `Record with ID ${id} not found in table ${table_name}.`);
        }

        // Update sys_status
        const [updatedCount] = await Model.update(
            { sys_status },
            { where: { id: recordId } }
        );

        if (updatedCount === 0) {
            return userSendResponse(res, 400, false, "No changes detected or update failed.");
        }

        return userSendResponse(res, 200, true, "Case record updated successfully!");
    } catch (error) {
        console.error("Error updating case status:", error);
        return userSendResponse(res, 500, false, "Internal Server Error.", error);
    }
};


// Define the file upload directory (public directory)
const dirPath = path.join(__dirname, "../public/files/");

// Ensure the directory exists
if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, dirPath);  // Set the destination folder for uploaded files
    },
    filename: (req, file, cb) => {
        // Create a unique file name by appending a UUID and original file extension
        const fileExtension = path.extname(file.originalname);
        const uniqueName = uuid.v4() + fileExtension;
        cb(null, uniqueName);
    }
});

// Initialize multer with the storage configuration
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
    fileFilter: (req, file, cb) => {
        // Allow only PDF files
        if (file.mimetype !== 'application/pdf') {
            return cb(new Error('Invalid file type. Only PDFs are allowed.'));
        }
        cb(null, true);
    }
}).single("file");  // Use single file upload

exports.uploadFile = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            console.error("File upload error:", err.message);
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ success: false, message: "File size exceeds the 10MB limit." });
            }
            return res.status(400).json({ success: false, message: err.message || "File upload failed." });
        }

        try {
            const { ui_case_id, created_by } = req.body;

            if (!ui_case_id || !created_by) {
                return res.status(400).json({ success: false, message: "Missing required fields." });
            }

            if (!req.file) {
                return res.status(400).json({ success: false, message: "No file uploaded." });
            }

            const file_name = req.file.filename;
            const file_path = path.join("files", file_name);

            await UiProgressReportFileStatus.create({
                ui_case_id,
                is_pdf: true,
                file_name,
                file_path,
                created_by,
                created_at: new Date()
            });

            return res.status(200).json({
                success: true,
                message: "File uploaded successfully.",
                file_path
            });
        } catch (error) {
            console.error("Error uploading file:", error);
            return res.status(500).json({ success: false, message: "Internal server error." });
        }
    });
};


exports.getUploadedFiles = async (req, res) => {
    try {
        const { ui_case_id } = req.body;

        if (!ui_case_id) {
            return res.status(400).json({ success: false, message: "Missing required ui_case_id." });
        }

        const data = await UiProgressReportFileStatus.findAll({
            where: { ui_case_id },
            attributes: ["id", "file_name", "file_path", "created_by", "created_at"]
        });

        if (!data.length) {
            return res.status(404).json({ success: false, message: "No files found." });
        }

        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error("Error fetching files:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};

exports.appendToLastLineOfPDF = async (req, res) => {
    const { ui_case_id, appendText } = req.body;
  
    if (!ui_case_id || !appendText) {
      return res.status(400).json({ success: false, message: "Missing required fields." });
    }
  
    try {
      // Fetch the latest uploaded PDF for the given ui_case_id
      const latestFile = await UiProgressReportFileStatus.findOne({
        where: { ui_case_id, is_pdf: true },
        order: [['created_at', 'DESC']],
      });
  
      if (!latestFile) {
        return res.status(404).json({ success: false, message: "No PDF file found for the given case ID." });
      }
  
      const pdfPath = path.join(__dirname, "../public", latestFile.file_path);
      const outputPath = path.join(__dirname, "../public/files", `updated_${latestFile.file_name}`);
  
      const existingPdfBytes = fs.readFileSync(pdfPath);
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
      // Create a new page and add it to the document
      const newPage = pdfDoc.addPage();
      newPage.drawText(appendText, {
        x: 50,
        y: newPage.getHeight() - 50, // Adjust Y based on where you want to place the text
        size: 12,
        font,
        color: rgb(0, 0, 0),
      });
  
      const pdfBytes = await pdfDoc.save();
      fs.writeFileSync(outputPath, pdfBytes);
      console.log(`Appended text to ${outputPath}`);
  
      // Update the existing database entry with the new file path
      await UiProgressReportFileStatus.update(
        { file_path: path.join("files", `updated_${latestFile.file_name}`) },
        { where: { id: latestFile.id } }
      );
  
      return res.status(200).json({ success: true, message: "PDF updated successfully.", file_path: outputPath });
    } catch (err) {
      console.error('Error appending to PDF:', err.message);
      return res.status(500).json({ success: false, message: "Internal server error." });
    }
  };