const { CasesAction , Template , ApprovalItem , Permission} = require("../models");
const { Op } = require("sequelize");

// Get all actions
exports.get_overall_actions = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            sort_by = 'created_at',
            sort_order = 'DESC'
        } = req.query;

        // Validate pagination parameters
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.max(1, parseInt(limit) || 10);
        const offset = (pageNum - 1) * limitNum;

        // Validate sort order
        const finalSortOrder = String(sort_order).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

        // Build where clause for search
        const whereClause = search.trim() 
            ? {
                [Op.or]: [
                    { name: { [Op.iLike]: `%${search.trim()}%` } },
                    { module: { [Op.iLike]: `%${search.trim()}%` } },
                    { table: { [Op.iLike]: `%${search.trim()}%` } }
                ]
            } 
            : {};

        // Get total count for pagination
        const total = await CasesAction.count({
            where: whereClause,
            distinct: true
        });

        // Get paginated and sorted data
        const actions = await CasesAction.findAll({
            where: whereClause,
            attributes: ['id', 'name', 'table', 'module', 'is_pdf', 'field', 'is_approval', 'permissions', 'approval_items', 'created_at'],
            order: [[sort_by, finalSortOrder]],
            offset: offset,
            limit: limitNum
        });

        return res.status(200).json({
            success: true,
            data: actions,
            meta: {
                total,
                totalPages: Math.ceil(total / limitNum),
                currentPage: pageNum,
                hasNextPage: pageNum < Math.ceil(total / limitNum),
                hasPrevPage: pageNum > 1,
                limit: limitNum
            }
        });

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
    const {module} = req.body; // Get pagination parameters from the request body


    try {
        // Get total count for pagination
        const total = await CasesAction.count({
            where: { module: { [Op.iLike]: module } }
        });

        // Get paginated actions for the specified module
        const data = await CasesAction.findAll({
            where: { module: { [Op.iLike]: module } },
            attributes: ['id', 'name', 'table', 'module', 'is_pdf', 'field', 'is_approval','permissions', 'approval_items', 'created_at']
        });

        return res.status(200).json({
            success: true,
            data: {
                data
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
    const { name, table, module, is_pdf, field ,is_approval ,permissions , approval_items } = req.body;

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
            is_pdf,
            field,
            is_approval,
            permissions, 
            approval_items
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
        const approval_item = await ApprovalItem.findAll();
        const permissions = await Permission.findAll();

        return res.status(200).json({
            success: true,
            other_templates,
            approval_item,
            permissions
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


