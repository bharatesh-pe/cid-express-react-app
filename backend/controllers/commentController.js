const Sequelize = require("sequelize");
const db = require('../models');
const { Template, Comment, user } = require("../models");
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


exports.createComment = async (req, res) => {
    try {
        const { template_id, table_row_id, comment, comment_date } = req.body;

        // Validate required fields
        if (!template_id || !table_row_id || !comment) {
            return userSendResponse(res, 400, false, "template_id, table_row_id, and comment are required.");
        }

        // Get the logged-in user's user_id from res.locals
        const user_id = res.locals.user_id;
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
            freezeTableName: true, // Prevent Sequelize from pluralizing table names
            timestamps: true,      // Enable createdAt and updatedAt columns
            createdAt: "created_at",
            updatedAt: "updated_at",
        });

        // Synchronize the model with the database
        await DynamicModel.sync();

        // Check if the row exists in the dynamic table
        const record = await DynamicModel.findOne({
            where: { id: table_row_id },
        });
        if (!record) {
            return userSendResponse(res, 404, false, `No record found in table '${table_name}' with id ${table_row_id}.`);
        }

        // Create the comment in the Comments table
        const newComment = await Comment.create({
            template_id,
            table_row_id,
            user_id, // Logged-in user's ID from res.locals
            comment,
            comment_date: comment_date || new Date(),
        });

        return userSendResponse(res, 201, true, "Comment created successfully.", newComment);
    } catch (error) {
        console.error(error);
        return userSendResponse(res, 500, false, "Failed to create comment.", {
            error: error.message || "Internal Server Error."
        });
    }
};


exports.updateComment = async (req, res) => {
    try {
        const { comment_id, template_id, table_row_id, comment, comment_date } = req.body;

        // Validate required fields
        if (!comment_id || !template_id || !table_row_id || !comment) {
            return userSendResponse(res, 400, false, "comment_id, template_id, table_row_id, and comment are required.");
        }

        // Get the logged-in user's user_id from res.locals
        const user_id = res.locals.user_id;
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
            freezeTableName: true, // Prevent Sequelize from pluralizing table names
            timestamps: true,      // Enable createdAt and updatedAt columns
            createdAt: "created_at",
            updatedAt: "updated_at",
        });

        // Synchronize the model with the database
        await DynamicModel.sync();

        // Check if the row exists in the dynamic table
        const record = await DynamicModel.findOne({
            where: { id: table_row_id },
        });
        if (!record) {
            return userSendResponse(res, 404, false, `No record found in table '${table_name}' with id ${table_row_id}.`);
        }

        // Fetch the comment to be updated
        const existingComment = await Comment.findOne({
            where: { comment_id, template_id, table_row_id, user_id },
        });
        if (!existingComment) {
            return userSendResponse(res, 404, false, "Comment not found or you do not have permission to update it.");
        }

        // Update the comment
        existingComment.comment = comment;
        if (comment_date) {
            existingComment.comment_date = comment_date;
        }
        await existingComment.save();

        return userSendResponse(res, 200, true, "Comment updated successfully.", existingComment);
    } catch (error) {
        console.error(error);
        return userSendResponse(res, 500, false, "Failed to update comment.", {
            error: error.message || "Internal Server Error."
        });
    }
};


exports.deleteComment = async (req, res) => {
    try {
        const { comment_id, template_id, table_row_id } = req.body;

        // Validate required fields
        if (!comment_id || !template_id || !table_row_id) {
            return userSendResponse(res, 400, false, "comment_id, template_id, and table_row_id are required.");
        }

        // Get the logged-in user's user_id from res.locals
        const user_id = res.locals.user_id;
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
            freezeTableName: true, // Prevent Sequelize from pluralizing table names
            timestamps: true,      // Enable createdAt and updatedAt columns
            createdAt: "created_at",
            updatedAt: "updated_at",
        });

        // Synchronize the model with the database
        await DynamicModel.sync();

        // Check if the row exists in the dynamic table
        const record = await DynamicModel.findOne({
            where: { id: table_row_id },
        });
        if (!record) {
            return userSendResponse(res, 404, false, `No record found in table '${table_name}' with id ${table_row_id}.`);
        }

        // Fetch the comment to be deleted
        const existingComment = await Comment.findOne({
            where: { comment_id, template_id, table_row_id, user_id },
        });
        if (!existingComment) {
            return userSendResponse(res, 404, false, "Comment not found or you do not have permission to delete it.");
        }

        // Delete the comment
        await existingComment.destroy();

        return userSendResponse(res, 200, true, "Comment deleted successfully.");
    } catch (error) {
        console.error(error);
        return userSendResponse(res, 500, false, "Failed to delete comment.", {
            error: error.message || "Internal Server Error."
        });
    }
};


exports.viewComment = async (req, res) => {
    try {
        const { comment_id, template_id, table_row_id } = req.body;

        // Validate required fields
        if (!comment_id || !template_id || !table_row_id) {
            return userSendResponse(res, 400, false, "comment_id, template_id, and table_row_id are required.");
        }

        // Get the logged-in user's user_id from res.locals
        const user_id = res.locals.user_id;
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

        // Fetch the specific comment
        const comment = await Comment.findOne({
            where: { comment_id, template_id, table_row_id, user_id },
        });

        if (!comment) {
            return userSendResponse(res, 404, false, "Comment not found.");
        }

        return userSendResponse(res, 200, true, "Comment retrieved successfully.", comment);
    } catch (error) {
        console.error(error);
        return userSendResponse(res, 500, false, "Failed to retrieve comment.", {
            error: error.message || "Internal Server Error."
        });
    }
};



exports.getComments = async (req, res) => {
    try {
        const { template_id, table_row_id } = req.body;

        // Validate required fields
        if (!template_id || !table_row_id) {
            return userSendResponse(res, 400, false, "template_id and table_row_id are required.");
        }

        // Get the logged-in user's user_id from res.locals
        const user_id = res.locals.user_id;
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

        // Fetch all comments for the specific table row and template, include user details
        const comments = await Comment.findAll({
            where: { template_id, table_row_id },
            order: [["comment_date", "DESC"]],
            include: [
                {
                    model: user,
                    as: 'user',
                    attributes: {
                        exclude: []
                    }
                }
            ]
        });

        if (comments.length === 0) {
            return userSendResponse(res, 404, false, "No comments found.");
        }

        // Format the response to include user information
        const formattedComments = comments.map(comment => ({
            comment_id: comment.comment_id,
            comment: comment.comment,
            template_id: comment.template_id,
            table_row_id: comment.table_row_id,
            comment_text: comment.comment_text,
            comment_date: comment.comment_date,
            user: {
                user_id: comment.user?.user_id,
                user_firstname: comment.user?.user_firstname,
                user_lastname: comment.user?.user_lastname,
                user_email: comment.user?.user_email,
                user_phone: comment.user?.user_phone,
                employee_id: comment.user?.employee_id,
                designation_id: comment.user?.designation_id,
                state_id: comment.user?.state_id,
                is_active: comment.user?.is_active,
            }
        }));

        return userSendResponse(res, 200, true, "Comments retrieved successfully.", formattedComments);
    } catch (error) {
        console.error("Error fetching comments:", error);
        return userSendResponse(res, 500, false, "Failed to fetch comments.", {
            error: error.message || "Internal Server Error."
        });
    }
};


exports.paginateComments = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 5,
            sort_by = 'id',
            order = 'ASC',
            search = '',
            search_field = '',
            table_name,
            table_row_id
        } = req.body;

        if (!table_name) {
            return userSendResponse(res, 400, false, "Table name is required.", null);
        }

        if (!table_row_id) {
            return userSendResponse(res, 400, false, "Table row ID is required.", null);
        }

        // Check if table exists in template
        const template = await Template.findOne({ where: { table_name } });
        if (!template) {
            return userSendResponse(res, 404, false, `Table ${table_name} does not exist.`, null);
        }

        const offset = (page - 1) * limit;

        // Construct the search criteria for comments
        const whereClause = {
            table_row_id: table_row_id      // Filter comments for this specific row
        };

        if (search) {
            if (search_field && ['comment', 'user_id'].includes(search_field)) {
                // Search in the specified field
                if (search_field === 'user_id' && !isNaN(search)) {
                    whereClause[search_field] = parseInt(search, 10);
                } else {
                    whereClause[search_field] = { [Op.like]: `%${search}%` };
                }
            } else {
                // Search across comment by default
                whereClause[Op.or] = [
                    { comment: { [Op.iLike]: `%${search}%` } }
                ];
            }
        }

        // Validate sort_by field
        const validSortFields = ['id', 'created_at', 'updated_at', 'user_id'];
        const validSortBy = validSortFields.includes(sort_by) ? sort_by : 'created_at';

        // Fetch paginated comments
        const result = await Comment.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [[validSortBy, order.toUpperCase()]],
            attributes: ['table_row_id', 'comment', 'user_id', 'created_at', 'updated_at']
        });

        const totalItems = result.count;
        const totalPages = Math.ceil(totalItems / limit);

        const responseData = {
            items: result.rows,
            meta: {
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                totalItems,
                totalPages,
                sort_by: validSortBy,
                order
            }
        };

        return userSendResponse(res, 200, true, "Comments fetched successfully", responseData);
    } catch (error) {
        console.error('Error fetching paginated comments:', error);
        return userSendResponse(res, 500, false, "Failed to fetch comments.", {
            error: error.message || "Internal Server Error."
        });
    }
};