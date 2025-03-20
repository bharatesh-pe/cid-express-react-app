const fs = require("fs");
const path = require("path");
const { Sequelize } = require("sequelize");
const dbConfig = require("../config/dbConfig");
const {
  Role,
  UsersDepartment,
  UsersDivision,
  UserDesignation,
  Users,
  AuthSecure,
  Designation,
  Department,
  Division,
  UserManagementLog,
} = require("../models");
const { Op } = require("sequelize");


// Create user
exports.create_user = async (req, res) => {
  const {
    username,
    role_id,
    kgid,
    pin,
    designation_id,
    department_id,
    division_id,
    created_by,
    transaction_id,
  } = req.body;

  // Username validation
  if (
    !username ||
    !username.trim() ||
    username == null ||
    username == "null" ||
    username == undefined
  ) {
    return res.status(400).json({
      success: false,
      message: "Name is required",
    });
  }

  // Role ID validation
  if (
    !role_id ||
    role_id == null ||
    role_id == "null" ||
    role_id == undefined
  ) {
    return res.status(400).json({
      success: false,
      message: "Role is required",
    });
  }

  // KGID validation
  if (
    !kgid ||
    !kgid.trim() ||
    kgid == null ||
    kgid == "null" ||
    kgid == undefined
  ) {
    return res.status(400).json({
      success: false,
      message: "KGID is required",
    });
  }

  // Designation ID validation
  if (
    !designation_id ||
    designation_id == null ||
    designation_id == "null" ||
    designation_id == undefined
  ) {
    return res.status(400).json({
      success: false,
      message: "Designation is required",
    });
  }

  // Department ID validation
  if (
    !department_id ||
    department_id == null ||
    department_id == "null" ||
    department_id == undefined
  ) {
    return res.status(400).json({
      success: false,
      message: "Department is required",
    });
  }

  // Division ID validation
  if (
    !division_id ||
    division_id == null ||
    division_id == "null" ||
    division_id == undefined
  ) {
    return res.status(400).json({
      success: false,
      message: "Division is required",
    });
  }

  // PIN validation
  if (!pin || !pin.trim() || pin == null || pin == "null" || pin == undefined) {
    return res.status(400).json({
      success: false,
      message: "PIN is required",
    });
  }

  if (!transaction_id || transaction_id == "") {
    return res
      .status(400)
      .json({ success: false, message: "Transaction Id is required!" });
  }

  const dirPath = path.join(__dirname, `../data/user_unique/${transaction_id}`);

  // Check if directory exists
  if (fs.existsSync(dirPath)) {
    return res.status(400).json({
      success: false,
      message: "Duplicate transaction detected.",
    });
  }
  // Create directory
  fs.mkdirSync(dirPath, { recursive: true });

  const t = await dbConfig.sequelize.transaction();

  try {
    // Check if user already exists
    const existingUser = await Users.findOne({ where: { kgid: kgid } });
    if (existingUser) {
      await t.rollback();
      return res.status(400).json({ message: "User already exists" });
    }

    // Create user
    const newUser = await Users.create(
      {
        name: username,
        role_id: role_id,
        kgid: kgid,
        created_by: created_by,
      },
      { transaction: t }
    );

    // Create auth secure
    await AuthSecure.create(
      {
        user_id: newUser.user_id,
        kgid: kgid,
        pin: pin,
      },
      { transaction: t }
    );

    // Create user designation
    const designationIds = designation_id.includes(",")
      ? designation_id.split(",").map((id) => parseInt(id.trim(), 10))
      : [parseInt(designation_id, 10)];
    for (const desigId of designationIds) {
      await UserDesignation.create(
        {
          user_id: newUser.user_id,
          designation_id: desigId,
          created_by: created_by,
        },
        { transaction: t }
      );
    }

    // Create user department
    const newUserDepartment = await UsersDepartment.create(
      {
        user_id: newUser.user_id,
        department_id: department_id,
        created_by: created_by,
      },
      { transaction: t }
    );

    // // Create user division (Get user_id from department)
    // await UsersDivision.create({
    //     users_department_id: newUserDepartment.users_departmentS  _id,
    //     division_id: division_id,
    //     created_by: created_by,
    //     user_id: newUserDepartment.user_id
    // }, { transaction: t });

    // Convert division_id to an array (similar to designation handling)
    const divisionIds = division_id.includes(",")
      ? division_id.split(",").map((id) => parseInt(id.trim(), 10))
      : [parseInt(division_id, 10)];

    // Insert new divisions
    for (const divId of divisionIds) {
      await UsersDivision.create(
        {
          users_department_id: newUserDepartment.users_department_id,
          division_id: divId,
          created_by: created_by,
          user_id: newUserDepartment.user_id,
        },
        { transaction: t }
      );
    }

    // Prepare logs for user management log
    const logs = [
        { user_id: newUser.user_id, field: 'name', info: username, at: new Date(), by: created_by },
        { user_id: newUser.user_id, field: 'role', info: role_id, at: new Date(), by: created_by },
        { user_id: newUser.user_id, field: 'kgid', info: kgid, at: new Date(), by: created_by },
        { user_id: newUser.user_id, field: 'designation', info: designation_id, at: new Date(), by: created_by },
        { user_id: newUser.user_id, field: 'department', info: department_id, at: new Date(), by: created_by },
        { user_id: newUser.user_id, field: 'division', info: division_id, at: new Date(), by: created_by }
    ];

    // Insert logs into UserManagementLog
    if (logs.length > 0) {
        await UserManagementLog.bulkCreate(logs, { transaction: t });
    }

    await t.commit();
    return res
      .status(201)
      .json({ success: true, message: "User created successfully" });
  } catch (error) {
    if (t.finished !== "rollback") {
      await t.rollback();
    }
    console.error("Error creating user:", error);
    return res
      .status(500)
      .json({ message: "Failed to create user", error: error.message });
  } finally {
    if (fs.existsSync(dirPath)) {
      fs.rmdirSync(dirPath, { recursive: true });
    }
  }
};

exports.update_user = async (req, res) => {
  const {
    user_id,
    username,
    role_id,
    kgid,
    designation_id,
    department_id,
    division_id,
    created_by,
    transaction_id,
  } = req.body;

  // Validation checks
  if (!username?.trim()) return res.status(400).json({ success: false, message: "Name is required" });
  if (!role_id) return res.status(400).json({ success: false, message: "Role is required" });
  if (!kgid?.trim()) return res.status(400).json({ success: false, message: "KGID is required" });
  if (!designation_id) return res.status(400).json({ success: false, message: "Designation is required" });
  if (!department_id) return res.status(400).json({ success: false, message: "Department is required" });
  if (!division_id) return res.status(400).json({ success: false, message: "Division is required" });
  if (!transaction_id) return res.status(400).json({ success: false, message: "Transaction Id is required!" });

  const dirPath = path.join(__dirname, `../data/user_unique/${transaction_id}`);
  if (fs.existsSync(dirPath)) return res.status(400).json({ success: false, message: "Duplicate transaction detected." });
  fs.mkdirSync(dirPath, { recursive: true });

  const t = await dbConfig.sequelize.transaction();

  try {
    const existingUser = await Users.findOne({ where: { user_id } });
    if (!existingUser) {
      await t.rollback();
      return res.status(404).json({ message: "User not found" });
    }

    const updatedFields = {};
    if (existingUser.name != username) updatedFields.name = username;
    if (existingUser.role_id != role_id) updatedFields.role = role_id;
    if (existingUser.kgid != kgid) updatedFields.kgid = kgid;

    if (Object.keys(updatedFields).length > 0) {
      await Users.update(updatedFields, { where: { user_id }, transaction: t });
      const logs = Object.entries(updatedFields).map(([field, newValue]) => ({
        user_id,
        field,
        info: `${newValue}`,
        at: new Date(),
        by: created_by,
      }));
      if (logs.length > 0) await UserManagementLog.bulkCreate(logs, { transaction: t });
    }

    const designationIds = (designation_id || "")
      .split(",")
      .map((id) => parseInt(id.trim(), 10))
      .filter((id) => !isNaN(id));

    const existingDesignations = await UserDesignation.findAll({ where: { user_id } });
    const existingDesignationIds = existingDesignations.map((d) => d.designation_id);

    const newDesignations = designationIds.filter((id) => !existingDesignationIds.includes(id));
    const removedDesignations = existingDesignationIds.filter((id) => !designationIds.includes(id));

    if (newDesignations.length > 0) {
      await UserDesignation.bulkCreate(
        newDesignations.map((desigId) => ({ user_id, designation_id: desigId, created_by })),
        { transaction: t }
      );
      await UserManagementLog.create(
        { user_id, field: "designation", info: `${designationIds}`, at: new Date(), by: created_by },
        { transaction: t }
      );
    }
    if (removedDesignations.length > 0) {
      await UserDesignation.destroy({ where: { user_id, designation_id: removedDesignations }, transaction: t });
    }

    const userDepartment = await UsersDepartment.findOne({ where: { user_id } });
    if (userDepartment && userDepartment.department_id !== department_id) {
      await UsersDepartment.update({ department_id }, { where: { user_id }, transaction: t });
      await UserManagementLog.create(
        { user_id, field: "department", info: `${department_id}`, at: new Date(), by: created_by },
        { transaction: t }
      );
    }

    const users_department_id = userDepartment ? userDepartment.users_department_id : null;
    const divisionIds = (division_id || "")
      .split(",")
      .map((id) => parseInt(id.trim(), 10))
      .filter((id) => !isNaN(id));

    const existingDivisions = users_department_id
      ? await UsersDivision.findAll({ where: { users_department_id } })
      : [];
    const existingDivisionIds = existingDivisions.map((d) => d.division_id);

    const newDivisions = divisionIds.filter((id) => !existingDivisionIds.includes(id));
    const removedDivisions = existingDivisionIds.filter((id) => !divisionIds.includes(id));

    if (newDivisions.length > 0) {
      await UsersDivision.bulkCreate(
        newDivisions.map((divId) => ({ users_department_id, division_id: divId, created_by, user_id })),
        { transaction: t }
      );
      await UserManagementLog.create(
        { user_id, field: "division", info: `${divisionIds}`, at: new Date(), by: created_by },
        { transaction: t }
      );
    }
    if (removedDivisions.length > 0) {
      await UsersDivision.destroy({ where: { users_department_id, division_id: removedDivisions }, transaction: t });
    }

    await t.commit();
    return res.status(201).json({ success: true, message: "User updated successfully" });
  } catch (error) {
    await t.rollback();
    console.error("Error updating user:", error);
    return res.status(500).json({ message: "Failed to update user", error: error.message });
  } finally {
    if (fs.existsSync(dirPath)) fs.rmSync(dirPath, { recursive: true, force: true });
  }
};

exports.user_active_deactive = async (req, res) => {
  const { user_id, dev_status, transaction_id } = req.body; // dev_status should be true or false

  if (!transaction_id || transaction_id == "") {
    return res
      .status(400)
      .json({ success: false, message: "Transaction Id is required!" });
  }

  const dirPath = path.join(__dirname, `../data/user_unique/${transaction_id}`);

  // Check if directory exists
  if (fs.existsSync(dirPath)) {
    return res.status(400).json({
      success: false,
      message: "Duplicate transaction detected.",
    });
  }
  // Create directory
  fs.mkdirSync(dirPath, { recursive: true });

  const t = await dbConfig.sequelize.transaction();

  try {
    // Check if the user exists
    const existingUser = await Users.findOne({ where: { user_id: user_id } });
    if (!existingUser) {
      await t.rollback();
      return res.status(404).json({ message: "User not found" });
    }

    // Update the user's dev_status
    await Users.update(
      { dev_status: dev_status },
      { where: { user_id: user_id }, transaction: t }
    );

    await t.commit();
    return res.status(200).json({
      success: true,
      message: `User ${dev_status ? "activated" : "deactivated"} successfully`,
    });
  } catch (error) {
    if (t.finished !== "rollback") {
      await t.rollback();
    }
    console.error("Error updating user status:", error);
    return res
      .status(500)
      .json({ message: "Failed to update user status", error: error.message });
  } finally {
    if (fs.existsSync(dirPath)) {
      fs.rmdirSync(dirPath, { recursive: true });
    }
  }
};

exports.get_users = async (req, res) => {
  const excluded_role_ids = [1, 10, 21];
  try {
    const users = await Users.findAll({
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["role_id", "role_title"],
          where: {
            role_id: {
              [Op.notIn]: excluded_role_ids,
            },
          },
        },
        {
          model: UserDesignation,
          as: "users_designations",
          attributes: ["designation_id"],
          include: [
            {
              model: Designation,
              as: "designation",
              attributes: ["designation_name"],
            },
          ],
        },
        {
          model: UsersDepartment,
          as: "users_departments",
          attributes: ["department_id"],
          include: [
            {
              model: Department,
              as: "department",
              attributes: ["department_name"],
            },
          ],
        },
        {
          model: UsersDivision,
          as: "users_division",
          attributes: ["division_id"],
          include: [
            {
              model: Division,
              as: "division",
              attributes: ["division_name"],
            },
          ],
        },
      ],
      attributes: ["user_id", "name", "role_id", "kgid", "dev_status"],
    });

    return res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch users", error: error.message });
  }
};

exports.filter_users = async (req, res) => {
  const {
    name,
    kgid,
    role_id,
    department_id,
    division_id,
    designation_id,
    dev_status,
  } = req.body;

  try {
    console.log("Received Filters:", req.body);

    const orConditions = [];

    if (name) orConditions.push({ name: { [Op.iLike]: `%${name}%` } });
    if (kgid) orConditions.push({ kgid: { [Op.iLike]: `%${kgid}%` } });
    if (role_id) orConditions.push({ role_id });
    if (department_id)
      orConditions.push({ "$users_departments.department_id$": department_id });
    if (division_id)
      orConditions.push({ "$users_division.division_id$": division_id });
    if (designation_id)
      orConditions.push({
        "$users_designations.designation_id$": designation_id,
      });
    if (dev_status !== undefined) orConditions.push({ dev_status });

    const filters = orConditions.length > 0 ? { [Op.or]: orConditions } : {}; // Apply OR condition

    console.log("Final Filters:", filters);

    const users = await Users.findAll({
      include: [
        { model: Role, as: "role", attributes: ["role_id", "role_title"] },
        {
          model: UserDesignation,
          as: "users_designations",
          attributes: ["designation_id"],
          include: [
            {
              model: Designation,
              as: "designation",
              attributes: ["designation_name"],
            },
          ],
        },
        {
          model: UsersDepartment,
          as: "users_departments",
          attributes: ["department_id"],
          include: [
            {
              model: Department,
              as: "department",
              attributes: ["department_name"],
            },
          ],
        },
        {
          model: UsersDivision,
          as: "users_division",
          attributes: ["division_id"],
          include: [
            { model: Division, as: "division", attributes: ["division_name"] },
          ],
        },
      ],
      where: filters,
      attributes: ["user_id", "name", "role_id", "kgid", "dev_status"],
    });

    return res.status(200).json({ users });
  } catch (error) {
    console.error("Error filtering users:", error);
    return res
      .status(500)
      .json({ message: "Failed to filter users", error: error.message });
  }
};

// Function to get user management logs
exports.get_user_management_logs = async (req, res) => {
    const { field, user_id } = req.body; // Get field and userId from query parameters

    try {
        // Fetch logs from the database based on field and userId, sorted in descending order
        const logs = await UserManagementLog.findAll({
            where: {
                user_id: user_id,
                field: field
            },
            order: [['at', 'DESC']], // Order by 'at' in descending order
        });

        // Check if logs are found
        if (logs.length === 0) {
            return res.status(404).json({ message: 'No logs found for the specified user and field.' });
        }

         // If the field is 'role', get the role names based on the log values
        if (field === 'role') {
            // Extract role IDs from the logs
            const roleIds = logs.map(log => log.info);

            // Fetch role names based on the role IDs
            const roles = await Role.findAll({
               attributes:['role_id','role_title'],
                where: {
                    role_id: roleIds
                }
            });

            // Create a mapping of role IDs to role names
            const roleMap = {};
            roles.forEach(role => {
                roleMap[role.role_id] = role.role_title; // Assuming 'id' is the role ID and 'name' is the role name
            });

            // Combine logs with role names
            const formattedLogs = logs.map(log => ({
                ...log.dataValues,
                info: roleMap[log.info] || 'Unknown Role' // Add role name to the log object
            }));

            // Return the logs with role names
            return res.status(200).json({"logs":formattedLogs});
        }

        // If the field is 'designation', get the designation names based on the log values
        if (field === 'designation') {
            // Extract designation IDs from the logs
            const designationIds = logs.map(log => log.info); // Assuming 'info' contains the designation IDs

            // Split the designation IDs and flatten the array
            const idsArray = designationIds.flatMap(idString => idString.split(',').map(id => id.trim()));

            // Fetch designation names based on the designation IDs
            const designations = await Designation.findAll({
                attributes:['designation_id','designation_name'],
                where: {
                    designation_id: idsArray
                }
            });

            // Create a mapping of designation IDs to designation names
            const designationMap = {};
            designations.forEach(designation => {
                designationMap[designation.designation_id] = designation.designation_name; // Assuming 'id' is the designation ID and 'name' is the designation name
            });

            // Combine logs with designation names
            const formattedLogs = logs.map(log => ({
                ...log.dataValues,
                info: log.info.split(',')
                    .map(id => designationMap[id.trim()] || 'Unknown Designation') // Get designation names
                    .join(' , ') // Join the names into a single string
            }));

            // Return the logs with designation names
            return res.status(200).json({ "logs": formattedLogs });
        }

         // If the field is 'department', get the department names based on the log values
        if (field === 'department') {
            // Extract department IDs from the logs
            const departmentIds = logs.map(log => log.info);

            // Fetch department names based on the department IDs
            const departments = await Department.findAll({
               attributes:['department_id','department_name'],
                where: {
                    department_id: departmentIds
                }
            });

            // Create a mapping of department IDs to department names
            const departmentMap = {};
            departments.forEach(department => {
                departmentMap[department.department_id] = department.department_name; // Assuming 'id' is the department ID and 'name' is the department name
            });

            // Combine logs with department names
            const formattedLogs = logs.map(log => ({
                ...log.dataValues,
                info: departmentMap[log.info] || 'Unknown Department' 
            }));

            // Return the logs with role names
            return res.status(200).json({"logs":formattedLogs});
        }


         // If the field is 'division', get the division names based on the log values
        if (field === 'division') {
            // Extract division IDs from the logs
            const divisionIds = logs.map(log => log.info); // Assuming 'info' contains the division IDs

            // Split the division IDs and flatten the array
            const idsArray = divisionIds.flatMap(idString => idString.split(',').map(id => id.trim()));

            // Fetch division names based on the division IDs
            const divisions = await Division.findAll({
                attributes:['division_id','division_name'],
                where: {
                    division_id: idsArray
                }
            });

            // Create a mapping of division IDs to division names
            const divisionMap = {};
            divisions.forEach(division => {
                divisionMap[division.division_id] = division.division_name; // Assuming 'id' is the designation ID and 'name' is the designation name
            });

            // Combine logs with designation names
            const formattedLogs = logs.map(log => ({
                ...log.dataValues,
                info: log.info.split(',')
                    .map(id => divisionMap[id.trim()] || 'Unknown Division') // Get division names
                    .join(' , ') // Join the names into a single string
            }));

            // Return the logs with division names
            return res.status(200).json({ "logs": formattedLogs });
        }

        // Return the logs as a response
        return res.status(200).json({"logs":logs});
    } catch (error) {
        console.error('Error fetching user management logs:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
