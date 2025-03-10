const db = require('../models');
const { Template, ActivityLog, user } = require('../models');
const { userSendResponse } = require("../services/userSendResponse");
const sequelize = db.sequelize;
const { Op } = require("sequelize");

exports.getActivityLog = async (req, res, next) => {
    const { template_id, table_row_id } = req.body;

    try {
        // Fetch the template details based on the template_id
        const template = await Template.findOne({
            where: { template_id },
        });

        if (!template) {
            return userSendResponse(
                res,
                404,
                false,
                `No template found for template_id: ${template_id}.`,
                null
            );
        }

        const { table_name } = template;

        // Dynamically reference the table using Sequelize
        const DynamicTable = sequelize.define(table_name, {}, { tableName: table_name, timestamps: false });

        // Check if the table_row_id exists in the dynamic table
        const row = await DynamicTable.findOne({
            where: { id: table_row_id }, // Assuming `id` is the primary key
        });

        if (!row) {
            return userSendResponse(
                res,
                404,
                false,
                `No entry found in ${table_name} for table_row_id: ${table_row_id}.`,
                null
            );
        }

        // Fetch activity logs for the given template_id and table_row_id, including user details
        const activityLogs = await ActivityLog.findAll({
            where: {
                template_id,
                table_row_id,
            },
            // include: [
            //     {
            //         model: Template,
            //         as: 'template',
            //         attributes: ['template_name'],
            //     },
            //     {
            //         model: user,
            //         as: 'user',
            //         attributes: { exclude: [] },
            //     },
            // ],
            order: [['created_at', 'DESC']],
        });

        if (!activityLogs || activityLogs.length === 0) {
            return userSendResponse(
                res,
                404,
                false,
                `No activity logs found for template_id: ${template_id} and table_row_id: ${table_row_id}.`,
                null
            );
        }

        // Format the response
        const formattedLogs = activityLogs.map(log => ({
            activity_log_id: log.activity_log_id,
            template_name: log.template?.template_name || null,
            table_row_id: log.table_row_id,
            activity: log.activity,
            username: log.actor_name,
            // user: {
            //     user_id: log.user?.user_id,
            //     user_firstname: log.user?.user_firstname,
            //     user_lastname: log.user?.user_lastname,
            //     user_email: log.user?.user_email,
            //     user_phone: log.user?.user_phone,
            //     employee_id: log.user?.employee_id,
            //     designation_id: log.user?.designation_id,
            //     state_id: log.user?.state_id,
            //     is_active: log.user?.is_active,
            // },
            created_at: log.created_at,
            updated_at: log.updated_at,
        }));

        return userSendResponse(
            res,
            200,
            true,
            `Fetched ${formattedLogs.length} activity log(s) for template_id: ${template_id} and table_row_id: ${table_row_id}.`,
            formattedLogs
        );
    } catch (error) {
        console.error("Error fetching activity logs:", error);
        return userSendResponse(res, 500, false, "Server error.", error);
    }
};

exports.paginateActivityLog = async (req, res, next) => {
    const { template_id, table_row_id, page = 1, limit = 10, sort_by = 'activity_log_id', order = 'ASC', search = '' } = req.body;

    try {
        // Fetch the template details based on the template_id
        const template = await Template.findOne({
            where: { template_id },
        });

        if (!template) {
            return userSendResponse(res, 404, false, `No template found for template_id: ${template_id}.`, null);
        }

        const { table_name } = template;

        // Dynamically reference the table using Sequelize
        const DynamicTable = sequelize.define(table_name, {}, { tableName: table_name, timestamps: false });

        // Check if the table_row_id exists in the dynamic table
        const row = await DynamicTable.findOne({
            where: { id: table_row_id },
        });

        if (!row) {
            return userSendResponse(res, 404, false, `No entry found in ${table_name} for table_row_id: ${table_row_id}.`, null);
        }

        // Validate sort_by and order
        const validSortColumns = ['activity_log_id', 'template_id', 'table_row_id', 'user_id', 'activity', 'created_at', 'updated_at'];
        const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'activity_log_id';
        const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

        // Fetch and paginate activity logs
        const { count, rows } = await ActivityLog.findAndCountAll({
            where: {
                template_id,
                table_row_id,
                activity: {
                    [Op.iLike]: `%${search}%`,
                },
            },
            include: [
                {
                    model: Template,
                    as: 'template',
                    attributes: ['template_name'],
                },
                {
                    model: user,
                    as: 'user',
                    attributes: { exclude: [] },
                },

            ],
            order: [[sortColumn, sortOrder]],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
        });

        if (!rows || rows.length === 0) {
            return userSendResponse(res, 404, false, `No activity logs found for template_id: ${template_id} and table_row_id: ${table_row_id}.`, null);
        }

        // Format the response
        const formattedLogs = rows.map(log => ({
            activity_log_id: log.activity_log_id,
            template_name: log.template.template_name,
            table_row_id: log.table_row_id,
            activity: log.activity,
            user: {
                user_id: log.user?.user_id,
                user_firstname: log.user?.user_firstname,
                user_lastname: log.user?.user_lastname,
                user_email: log.user?.user_email,
                user_phone: log.user?.user_phone,
                employee_id: log.user?.employee_id,
                designation_id: log.user?.designation_id,
                state_id: log.user?.state_id,
                is_active: log.user?.is_active,
            },

            created_at: log.created_at,
            updated_at: log.updated_at,
        }));

        return userSendResponse(
            res,
            200,
            true,
            `Fetched ${formattedLogs.length} activity log(s) for template_id: ${template_id} and table_row_id: ${table_row_id}.`,
            {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                data: formattedLogs,
            }
        );
    } catch (error) {
        console.error("Error fetching activity logs:", error);
        return userSendResponse(res, 500, false, "Server error.", error);
    }
};
