const {
  CasesAction,
  Template,
  ApprovalItem,
  Permission,
} = require("../models");
const { Op } = require("sequelize");
const fs = require("fs");
const path = require("path");

// Get all actions
exports.get_overall_actions = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort_by = "created_at", order = "DESC", search = "" } = req.body;
    const offset = (page - 1) * limit;

    const validSortFields = [
      "id",
      "name",
      "table",
      "module",
      "is_pdf",
      "field",
      "is_approval",
      "permissions",
      "is_view_action",
      "approval_items",
      "created_at",
    ];
    const finalSortBy = validSortFields.includes(sort_by) ? sort_by : "created_at";
    const finalOrder = String(order).toUpperCase() === "ASC" ? "ASC" : "DESC";

    // // Validate sort order
    // const finalSortOrder =
    //   String(sort_order).toUpperCase() === "DESC" ? "DESC" : "ASC";

    // Build where clause for search
    const whereClause = search.trim()
      ? {
          [Op.or]: [
            { name: { [Op.iLike]: `%${search.trim()}%` } },
            { module: { [Op.iLike]: `%${search}%` } },
            { table: { [Op.iLike]: `%${search.trim()}%` } },
          ],
        }
      : {};


    // Get paginated and sorted data
    const { rows: actions, count: totalItems } = await CasesAction.findAndCountAll({
        where: whereClause,
        attributes: [
            "id",
            "name",
            "table",
            "module",
            "is_pdf",
            "field",
            "is_approval",
            "permissions",
            "is_view_action",
            "approval_items",
            "created_at",
        ],
        order: [[finalSortBy, finalOrder]],
        limit,
        offset,
    });

    // const totalItems = records.count;
    const totalPages = Math.ceil(totalItems / limit);

    return res.status(200).json({
      success: true,
      data: actions,
      meta: { page, limit, totalItems,totalPages, order,}
    });
  } catch (error) {
    console.error("Error fetching actions:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch actions",
      error: error.message,
    });
  }
};

// Get actions by module
exports.get_actions = async (req, res) => {
  const { module, tab } = req.body; // Get pagination parameters from the request body

  try {
    // Get total count for pagination
    const total = await CasesAction.count({
      where: { module: { [Op.iLike]: module } },
    });

    const whereCondition = {
      module: { [Op.iLike]: module },
    };

    if (typeof tab === "string") {
      whereCondition.tab = { [Op.iLike]: `%${tab}%` };
    }

    // Get paginated actions for the specified module
    const data = await CasesAction.findAll({
      where: whereCondition,
      attributes: [
        "id",
        "name",
        "table",
        "module",
        "is_pdf",
        "field",
        "is_approval",
        "is_view_action",
        "permissions",
        "approval_items",
        "created_at",
        "tab",
        "icon",
        "approval_steps",
      ],
        order: [["created_at", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      data: {
        data,
      },
    });
  } catch (error) {
    console.error("Error fetching actions by module:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch actions",
      error: error.message,
    });
  }
};

// Insert new action
exports.insert_action = async (req, res) => {
  const {
    name,
    table,
    module,
    is_pdf,
    field,
    is_approval,
    is_view_action,
    permissions,
    approval_items,
    tab,
    icon,
    approval_steps,
    transaction_id,
  } = req.body;
  console.log(req.body, "Request body received in backend");

  // Validate required fields
  if (!name || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: "Name is required",
    });
  }

  if (!table || !table.trim()) {
    return res.status(400).json({
      success: false,
      message: "Table is required",
    });
  }

  if (!module || !module.trim()) {
    return res.status(400).json({
      success: false,
      message: "Module is required",
    });
  }

  const dirPath = path.join(__dirname, `../data/user_unique/${transaction_id}`);
  if (fs.existsSync(dirPath))
    return res
      .status(400)
      .json({ success: false, message: "Duplicate transaction detected." });
  fs.mkdirSync(dirPath, { recursive: true });

  try {
    // Check for duplicate name in the same module (case-insensitive)
    const existingAction = await CasesAction.findOne({
      where: {
        name: { [Op.iLike]: name },
        module: { [Op.iLike]: module },
      },
    });

    if (existingAction) {
      return res.status(400).json({
        success: false,
        message: "Action name already exists in this module",
      });
    }

    const newAction = await CasesAction.create({
      name,
      table,
      module,
      is_pdf,
      field,
      is_approval,
      is_view_action,
      permissions,
      approval_items,
      tab,
      icon,
      approval_steps
    });

    return res.status(201).json({
      success: true,
      message: "Action created successfully",
      action: newAction,
    });
  } catch (error) {
    console.error("Error creating action:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create action",
      error: error.message,
    });
  } finally {
    if (fs.existsSync(dirPath))
      fs.rmSync(dirPath, { recursive: true, force: true });
  }
};

// Delete action
exports.delete_action = async (req, res) => {
  const { id, transaction_id } = req.body;

  const dirPath = path.join(__dirname, `../data/user_unique/${transaction_id}`);
  if (fs.existsSync(dirPath))
    return res
      .status(400)
      .json({ success: false, message: "Duplicate transaction detected." });
  fs.mkdirSync(dirPath, { recursive: true });

  try {
    // Check if action exists
    const action = await CasesAction.findByPk(id);
    if (!action) {
      return res.status(404).json({
        success: false,
        message: "Action not found",
      });
    }

    // Delete the action
    await action.destroy();

    return res.status(200).json({
      success: true,
      message: "Action deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting action:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete action",
      error: error.message,
    });
  } finally {
    if (fs.existsSync(dirPath))
      fs.rmSync(dirPath, { recursive: true, force: true });
  }
};

//get other tempelates from template table
exports.get_other_templates = async (req, res) => {
  try {
    // Get paginated actions for the specified module
    const other_templates = await Template.findAll();
    const approval_item = await ApprovalItem.findAll();
    const permissions = await Permission.findAll();

    return res.status(200).json({
      success: true,
      other_templates,
      approval_item,
      permissions,
    });
  } catch (error) {
    console.error("Error fetch others template :", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch others template",
      error: error.message,
    });
  }
};
