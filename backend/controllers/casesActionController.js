const { CasesAction , Template} = require("../models");
const { Op } = require("sequelize");

// Get all actions
exports.get_overall_actions = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            sort_by = 'id',
            sort_order = 'ASC'
        } = req.body;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const finalSortOrder = sort_order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        var whereClause = {};
        // Build where clause for search
        if(search && search !='')
        {
            whereClause = search 
                ? {
                    [Op.or]: [
                        { name: { [Op.iLike]: `%${search}%` } },
                        { module: { [Op.iLike]: `%${search}%` } },
                        { table: { [Op.iLike]: `%${search}%` } }
                    ]
                } 
                : {};
        }

        // Get total count for pagination
        const total = await CasesAction.count({ where: whereClause });

        // Get paginated and sorted data
        const actions = await CasesAction.findAll({
            where: whereClause,
            attributes: ['id', 'name', 'table', 'module', 'is_pdf', 'created_at'],
            order: [[sort_by, finalSortOrder]],
            offset: offset,
            limit: parseInt(limit)
        });

        // Calculate pagination details
        const totalPages = Math.ceil(total / limit);

        // Format the response as an array of objects
        const response = {
            data: actions.map(action => action.toJSON()), // Convert actions to JSON
            meta: {
                total,
                totalPages,
                currentPage: parseInt(page),
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        };

        return res.status(200).json(response);

    } catch (error) {
        console.error("Error fetching actions:", error);
        return res.status(500).json({ 
            success: false,
            message: "Failed to fetch actions", 
            error: error.message 
        });
    }
};

// Get actions by module
exports.get_actions = async (req, res) => {
    const { page = 1, limit = 10 , module} = req.body; // Get pagination parameters from the request body

    const offset = (parseInt(page) - 1) * parseInt(limit);

    try {
        // Get total count for pagination
        const total = await CasesAction.count({
            where: { module: { [Op.iLike]: module } }
        });

        // Get paginated actions for the specified module
        const data = await CasesAction.findAll({
            where: { module: { [Op.iLike]: module } },
            attributes: ['id', 'name', 'table', 'module', 'is_pdf', 'created_at'],
            limit: parseInt(limit),
            offset: offset,
            order: [['created_at', 'DESC']] // Optional: Order by created_at or any other field
        });

        // Calculate pagination details
        const totalPages = Math.ceil(total / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return res.status(200).json({
            success: true,
            data: {
                data,
                meta: {
                    total,
                    totalPages,
                    currentPage: parseInt(page),
                    limit: parseInt(limit),
                    hasNextPage,
                    hasPrevPage
                }
            }
        });

    } catch (error) {
        console.error("Error fetching actions by module:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch actions",
            error: error.message
        });
    }
};

// Insert new action
exports.insert_action = async (req, res) => {
    const { name, table, module, is_pdf } = req.body;

    // Validate required fields
    if (!name || !name.trim()) {
        return res.status(400).json({
            success: false,
            message: "Name is required"
        });
    }

    if (!table || !table.trim()) {
        return res.status(400).json({
            success: false,
            message: "Table is required"
        });
    }

    if (!module || !module.trim()) {
        return res.status(400).json({
            success: false,
            message: "Module is required"
        });
    }

    try {

        // Check for duplicate name in the same module (case-insensitive)
        const existingAction = await CasesAction.findOne({
            where: {
                name: { [Op.iLike]: name },
                module: { [Op.iLike]: module }
            }
        });

        if (existingAction) {
            return res.status(400).json({
                success: false,
                message: "Action name already exists in this module"
            });
        }

        const newAction = await CasesAction.create({
            name,
            table,
            module,
            is_pdf
        });

        return res.status(201).json({
            success: true,
            message: "Action created successfully",
            action: newAction
        });

    } catch (error) {
        console.error("Error creating action:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create action",
            error: error.message
        });
    }
};

// Delete action
exports.delete_action = async (req, res) => {
    const { id } = req.body;

    try {
        // Check if action exists
        const action = await CasesAction.findByPk(id);
        if (!action) {
            return res.status(404).json({
                success: false,
                message: "Action not found"
            });
        }

        // Delete the action
        await action.destroy();

        return res.status(200).json({
            success: true,
            message: "Action deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting action:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete action",
            error: error.message
        });
    }
}; 

//get other tempelates from template table
exports.get_other_templates = async (req , res) => {
    try {
         // Get paginated actions for the specified module
        const other_templates = await Template.findAll();

        return res.status(200).json({
            success: true,
            other_templates
        });

    } catch (error) {
        console.error("Error fetch others template :", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch others template",
            error: error.message
        });
    }
};