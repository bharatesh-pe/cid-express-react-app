const {
  MastersMeta,
  Role,
  Designation,
  Department,
  KGID,
  Division,
  ApprovalItem,
  UsersHierarchy,
} = require("../models");
const { Op } = require("sequelize");
const fs = require("fs");
const path = require("path");

exports.fetch_masters_meta = async (req, res) => {
  try {
    const excluded_masters_ids = [];

    const master = await MastersMeta.findAll({
      where: {
        masters_meta_id: {
          [Op.notIn]: excluded_masters_ids,
        },
      },
    });
    return res.status(200).json({ success: true, master });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.fetch_specific_master_data = async (req, res) => {
  const { master_name } = req.body;

  try {
    let data;

    switch (master_name) {
      case "department":
        data = await Department.findAll();
        break;

      case "designation":
        data = await Designation.findAll({
          attributes: [
            "designation_id",
            "designation_name",
            "description",
            "created_by",
            "created_at",
          ],
        });
        break;

      case "division":
        data = await Division.findAll();
        const departmentIds = data.map((division) => division.department_id);
        const departments = await Department.findAll({
          where: {
            department_id: departmentIds,
          },
        });
        const departmentMap = {};
        departments.forEach((department) => {
          departmentMap[department.department_id] = department.department_name;
        });

        const formattedDivisions = data.map((division) => ({
          ...division.dataValues,
          department_name:
            departmentMap[division.department_id] || "Unknown Department",
        }));

        return res.status(200).json({ divisions: formattedDivisions });
      case "approval_item":
        data = await ApprovalItem.findAll();
        break;
      case "kgid":
        data = await KGID.findAll();
        break;
      case "hierarchy":
        data = await UsersHierarchy.findAll();
        break;

      default:
        return res
          .status(400)
          .json({ message: "Invalid master name provided." });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.create_master_data = async (req, res) => {
  const { master_name, data, transaction_id } = req.body;

  // Get the role id from the request (assuming it's in the request body)
  const { user_id } = req.user;

  data.created_by = user_id;

  const dirPath = path.join(__dirname, `../data/user_unique/${transaction_id}`);
  if (fs.existsSync(dirPath))
    return res
      .status(400)
      .json({ success: false, message: "Duplicate transaction detected." });
  fs.mkdirSync(dirPath, { recursive: true });

  try {
    let newEntry;

    switch (master_name) {
      case "Department":
        newEntry = await Department.create(data);
        break;

      case "Designation":
        newEntry = await Designation.create(
          {
            designation_name: data.designation_name,
            description: data.description,
            created_by: data.created_by,
            created_at: new Date(),
          },
          {
            returning: [
              "designation_id",
              "designation_name",
              "description",
              "created_by",
              "created_at",
            ],
          }
        );
        break;

      case "Division":
        newEntry = await Division.create({
          division_name: data.division_name,
          description: data.description,
          department_id: data.department_id,
          created_by: data.created_by,
          created_at: new Date(),
        });
        break;
      case "Approval Item":
        newEntry = await ApprovalItem.create(data);
        break;

      case "Kgid":
        const existingKgid = await KGID.findOne({
          where: { kgid: data.kgid },
        });

        if (existingKgid) {
          return res.status(400).json({
            success: false,
            message: "KGID already exists.",
          });
        }

        const existingMobile = await KGID.findOne({
          where: { mobile: data.mobile },
        });

        if (existingMobile) {
          return res.status(400).json({
            success: false,
            message: "Mobile already exists.",
          });
        }

        newEntry = await KGID.create({
          kgid: data.kgid,
          name: data.name,
          mobile: data.mobile,
          start_date: new Date(),
          end_date: data.end_date || null,
          created_by: data.created_by,
        });
        break;

      case "Hierarchy":
        newEntry = await UsersHierarchy.create({
          supervisor_designation_id: data.supervisor_designation_id,
          officer_designation_id: data.officer_designation_id,
          created_by: data.created_by,
          created_at: new Date(),
        });
        break;

      default:
        return res
          .status(400)
          .json({ message: "Invalid master name provided." });
    }

    return res.status(201).json({
      success: true,
      message: `${master_name} created successfully`,
      data: newEntry,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    if (fs.existsSync(dirPath))
      fs.rmSync(dirPath, { recursive: true, force: true });
  }
};
exports.update_master_data = async (req, res) => {
  const { master_name, data, transaction_id } = req.body;

  const { user_id } = req.user;
  data.updated_by = user_id;

  const dirPath = path.join(__dirname, `../data/user_unique/${transaction_id}`);
  if (fs.existsSync(dirPath))
    return res
      .status(400)
      .json({ success: false, message: "Duplicate transaction detected." });
  fs.mkdirSync(dirPath, { recursive: true });

  try {
    let result;
    let whereCondition = {};

    switch (master_name) {
      case "Department":
        if (!data.department_id) {
          return res
            .status(400)
            .json({ message: "Department ID is required for update." });
        }
        whereCondition = { department_id: data.department_id };
        result = await Department.update(data, { where: whereCondition });
        break;

      case "Designation":
        if (!data.designation_id) {
          return res
            .status(400)
            .json({ message: "Designation ID is required for update." });
        }
        whereCondition = { designation_id: data.designation_id };
        result = await Designation.update(
          {
            designation_name: data.designation_name,
            description: data.description,
            updated_by: data.updated_by,
          },
          { where: whereCondition }
        );
        break;

      case "Division":
        if (!data.division_id) {
          return res
            .status(400)
            .json({ message: "Division ID is required for update." });
        }
        whereCondition = { division_id: data.division_id };
        result = await Division.update(
          {
            division_name: data.division_name,
            department_id: data.department_id,
            updated_by: data.updated_by,
          },
          { where: whereCondition }
        );
        break;
      case "Approval Item":
        if (!data.approval_item_id) {
          return res
            .status(400)
            .json({ message: "Item ID is required for update." });
        }
        whereCondition = { approval_item_id: data.approval_item_id };
        result = await ApprovalItem.update(data, { where: whereCondition });
        break;
      case "Kgid":
        if (!data.id) {
          return res
            .status(400)
            .json({ message: "KGID ID is required for update." });
        }
        whereCondition = { id: data.id };
        result = await KGID.update(
          {
            kgid: data.kgid,
            name: data.name,
            mobile: data.mobile,
            start_date: data.start_date,
            end_date: data.end_date,
            updated_by: data.updated_by,
          },
          { where: whereCondition }
        );
        break;

      case "Hierarchy":
        if (!data.hierarchy_id) {
          return res
            .status(400)
            .json({ message: "Hierarchy ID is required for update." });
        }
        whereCondition = { users_hierarchy_id: data.hierarchy_id };
        result = await UsersHierarchy.update(
          {
            users_hierarchy_id: data.hierarchy_id,
            officer_designation_id: data.officer_designation_id,
            supervisor_designation_id: data.supervisor_designation_id,
          },
          { where: whereCondition }
        );
        break;

      default:
        return res
          .status(400)
          .json({ message: "Invalid master name provided." });
    }

    return res.status(200).json({
      success: true,
      message: `${master_name} updated successfully`,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    if (fs.existsSync(dirPath))
      fs.rmSync(dirPath, { recursive: true, force: true });
  }
};
exports.delete_master_data = async (req, res) => {
  const { master_name, id, transaction_id } = req.body;

  const dirPath = path.join(__dirname, `../data/user_unique/${transaction_id}`);
  if (fs.existsSync(dirPath))
    return res
      .status(400)
      .json({ success: false, message: "Duplicate transaction detected." });
  fs.mkdirSync(dirPath, { recursive: true });

  try {
    let result;
    let whereCondition = {};

    switch (master_name) {
      case "Department":
        if (!id) {
          return res
            .status(400)
            .json({ message: "Department ID is required for deletion." });
        }
        whereCondition = { department_id: id };
        result = await Department.destroy({ where: whereCondition });
        break;

      case "Designation":
        if (!id) {
          return res
            .status(400)
            .json({ message: "Designation ID is required for deletion." });
        }
        whereCondition = { designation_id: id };
        result = await Designation.destroy({ where: whereCondition });
        break;

      case "Division":
        if (!id) {
          return res
            .status(400)
            .json({ message: "Division ID is required for deletion." });
        }
        whereCondition = { division_id: id };
        result = await Division.destroy({ where: whereCondition });
        break;
      case "Kgid":
        if (!id) {
          return res
            .status(400)
            .json({ message: "KGID is required for deletion." });
        }
        whereCondition = { id: id };
        result = await KGID.destroy({ where: whereCondition });
        break;
      case "Approval Item":
        if (!id) {
          return res
            .status(400)
            .json({ message: "Item ID is required for deletion." });
        }
        whereCondition = { approval_item_id: id };
        result = await ApprovalItem.destroy({ where: whereCondition });
        break;
      case "Hierarchy":
        if (!id) {
          return res
            .status(400)
            .json({ message: "Hierarchy ID is required for deletion." });
        }
        whereCondition = { users_hierarchy_id: id };
        result = await UsersHierarchy.destroy({ where: whereCondition });
        break;
      default:
        return res
          .status(400)
          .json({ message: "Invalid master name provided." });
    }

    if (result === 0) {
      return res
        .status(404)
        .json({ message: `${master_name} not found or already deleted.` });
    }

    return res.status(200).json({
      success: true,
      message: `${master_name} deleted successfully`,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete master data.",
      error: error.message,
    });
  } finally {
    if (fs.existsSync(dirPath))
      fs.rmSync(dirPath, { recursive: true, force: true });
  }
};
