const fs = require('fs');
const path = require('path');
const { Role } = require('../models');

exports.create_role = async (req, res) => {
  const {
    transaction_id,
    role_title,
    role_description,
    permissions
  } = req.body;
  
  const dirPath = path.join(__dirname, `../data/role_unique/${transaction_id}`);
  const filePath = path.join(dirPath, 'info.txt');
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
    // Create an empty file inside the directory
    fs.writeFileSync(filePath, '');

    // Check if the role title already exists
    const existingRole = await Role.findOne({ where: { role_title } });
    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: `Role with title ${role_title} already exists.`
      });
    }

    const newRole = await Role.create({
      role_title,
      role_description,
      ...permissions,
      created_at: new Date()
    });

    return res.status(201).json({
      success: true,
      message: `Role ${newRole.role_title} created successfully.`,
      data: {
        id: newRole.role_id,
        roleTitle: newRole.role_title,
        permissions: newRole.permissions
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
  finally {
    if (fs.existsSync(dirPath)) {
      fs.rmdirSync(dirPath, { recursive: true });
    }
  }
};

exports.get_all_roles = async (req, res) => {
  try {
    const roles = await Role.findAll();

    if (!roles.length) {
      return res.status(404).json({
        success: false,
        message: "No roles found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Roles fetched successfully.",
      data: roles
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


exports.update_role = async (req, res) => {

  const {
    id,
    transaction_id,
    role_title,
    role_description,
    permissions
  } = req.body;

  const dirPath = path.join(__dirname, `../data/role_unique/${transaction_id}`);
  const filePath = path.join(dirPath, 'info.txt');

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
        // Create an empty file inside the directory
        fs.writeFileSync(filePath, '');
    // Check if the role exists
    const existingRole = await Role.findByPk(id);
    if (!existingRole) {
      return res.status(404).json({
        success: false,
        message: `Role with id ${id} not found.`
      });
    }

    // Check if the new role title already exists (excluding the current role)
    if (role_title && role_title !== existingRole.role_title) {
      const roleWithSameTitle = await Role.findOne({ where: { role_title } });
      if (roleWithSameTitle) {
        return res.status(400).json({
          success: false,
          message: `Role with title ${role_title} already exists.`
        });
      }
    }

    // Update the role
    await existingRole.update({
      role_title,
      role_description,
      ...permissions,
      updated_at: new Date()
    });

    return res.status(200).json({
      success: true,
      message: `Role ${existingRole.role_title} updated successfully.`,
      data: {
        id: existingRole.role_id,
        transaction_id: existingRole.transaction_id,
        roleTitle: existingRole.role_title,
        permissions: existingRole.permissions
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
  finally {
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
        message: `Role with id ${id} not found.`
      });
    }

    // Delete the role
    await existingRole.destroy();

    return res.status(200).json({
      success :true,
      message: `Role ${existingRole.role_title} deleted successfully.`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};