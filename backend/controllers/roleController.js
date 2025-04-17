const fs = require("fs");
const path = require("path");
const { Role, Permission, Module } = require("../models");
const { Op, and } = require("sequelize");

exports.create_role = async (req, res) => {
  const { transaction_id, role_title, role_description, permissions } =
    req.body;

  const dirPath = path.join(__dirname, `../data/role_unique/${transaction_id}`);
  const filePath = path.join(dirPath, "info.txt");
  try {
    // Check if directory exists
    if (fs.existsSync(dirPath)) {
      return res.status(400).json({
        success: false,
        message: "Duplicate transaction detected.",
      });
    }
    // Create directory
    fs.mkdirSync(dirPath, { recursive: true });

    // Check if the role title already exists
    const existingRole = await Role.findOne({
      where: {
        role_title: {
          [Op.iLike]: role_title,
        },
      },
    });
    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: `Role with title ${role_title} already exists.`,
      });
    }
    const newRole = await Role.create({
      role_title,
      role_description,
      ...permissions,
      created_at: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: `Role ${newRole.role_title} created successfully.`,
      data: {
        id: newRole.role_id,
        roleTitle: newRole.role_title,
        permissions: newRole.permissions,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  } finally {
    if (fs.existsSync(dirPath)) {
      fs.rmdirSync(dirPath, { recursive: true });
    }
  }
};

exports.get_all_roles = async (req, res) => {
  try {
    const excluded_role_ids = [1];
    const roles = await Role.findAll({
      where: {
        role_id: {
          [Op.notIn]: excluded_role_ids,
        },
      },
    });

    if (!roles.length) {
      return res.status(404).json({
        success: false,
        message: "No roles found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Roles fetched successfully.",
      data: roles,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.get_all_permissions = async (req, res) => {
  try {
    const permissions = await Permission.findAll({
      order: [["order_by", "ASC"]],
    });

    if (!permissions.length) {
      return res.status(404).json({
        success: false,
        message: "No permissions found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Permissions fetched successfully.",
      data: permissions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.get_all_module = async (req, res) => {
  try {
    const exception_modules_id =[4,1,2,3,15];
    const modules = await Module.findAll({
      attributes: ["module_id", "ui_name", "sub_modules", "name"],
      order: [["order", "ASC"]],
      where: {
        is_sub_module: {
          [Op.not]: true,
        },
        module_id: {
          [Op.notIn]: exception_modules_id,
        },
      },
    });

    if (!modules.length) {
      return res.status(404).json({
        success: false,
        message: "No module found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "module fetched successfully.",
      data: modules,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.update_role = async (req, res) => {
  const { id, transaction_id, role_title, role_description, permissions } =
    req.body;

  const dirPath = path.join(__dirname, `../data/role_unique/${transaction_id}`);
  const filePath = path.join(dirPath, "info.txt");

  try {
    // Check if directory exists
    if (fs.existsSync(dirPath)) {
      return res.status(400).json({
        success: false,
        message: "Duplicate transaction detected.",
      });
    }
    // Create directory
    fs.mkdirSync(dirPath, { recursive: true });
    // Check if the role exists
    const existingRole = await Role.findByPk(id);
    if (!existingRole) {
      return res.status(404).json({
        success: false,
        message: `Role with id ${id} not found.`,
      });
    }

    // Check if the new role title already exists (excluding the current role)
    if (
      role_title &&
      role_title.toLowerCase() !== existingRole.role_title.toLowerCase()
    ) {
      const roleWithSameTitle = await Role.findOne({
        where: {
          role_title: { [Op.iLike]: role_title },
          role_id: { [Op.ne]: id }, // Exclude current role
        },
      });
      if (roleWithSameTitle) {
        return res.status(400).json({
          success: false,
          message: `Role with title ${role_title} already exists.`,
        });
      }
    }

    // Update the role
    await existingRole.update({
      role_title,
      role_description,
      ...permissions,
      updated_at: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: `Role ${existingRole.role_title} updated successfully.`,
      data: {
        id: existingRole.role_id,
        transaction_id: existingRole.transaction_id,
        roleTitle: existingRole.role_title,
        permissions: existingRole.permissions,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  } finally {
    if (fs.existsSync(dirPath)) {
      fs.rmdirSync(dirPath, { recursive: true });
    }
  }
};

exports.delete_role = async (req, res) => {
  try {
    const { id } = req.body;

    // Check if the role exists
    const existingRole = await Role.findByPk(id);
    if (!existingRole) {
      return res.status(404).json({
        success: false,
        message: `Role with id ${id} not found.`,
      });
    }

    // Delete the role
    await existingRole.destroy();

    return res.status(200).json({
      success: true,
      message: `Role ${existingRole.role_title} deleted successfully.`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
