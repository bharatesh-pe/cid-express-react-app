const fs = require("fs");
const path = require("path");
const { Sequelize } = require("sequelize");
const dbConfig = require("../config/dbConfig");
const { userSendResponse } = require("../services/userSendResponse");
const { Template, admin_user, user, ActivityLog, Download, ProfileAttachment, ProfileHistory, event, event_tag_organization, event_tag_leader, event_summary, ProfileLeader, ProfileOrganization, TemplateStar, TemplateUserStatus ,KGID} = require("../models");
const db = require('../models');
const sequelize = db.sequelize;

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
  UsersHierarchy,
  UsersHierarchyNew,
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
    mobile,
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

  // if(!mobile || !mobile.trim() || mobile == null || mobile == "null" || mobile == undefined) {
  //   return res.status(400).json({
  //     success: false,
  //     message: "Mobile is required",
  //   });
  // }

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
    const existingUser = await Users.findOne({ where: { kgid_id: kgid } });
    if (existingUser) {
      await t.rollback();
      return res.status(400).json({ message: "User already exists" });
    }

    // Create user
    const newUser = await Users.create(
      {
        name: username,
        role_id: role_id,
        kgid_id: kgid,
        created_by: created_by,
      },
      { transaction: t }
    );


    // Create auth secure
    await AuthSecure.create(
      {
        user_id: newUser.user_id,
        kgid_id: kgid,
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

    const departmentIds = department_id.includes(",") ? department_id.split(",").map((id) => parseInt(id.trim(), 10)) : [parseInt(department_id, 10)];
    // const departmentIds = [department_id];

    const divisionIds = division_id.includes(",") ? division_id.split(",").map((id) => parseInt(id.trim(), 10)) : [parseInt(division_id, 10)];

    if (departmentIds.length > 0) {
        for (const depId of departmentIds) {
            // Create a new UsersDepartment for each department ID
            const newUserDepartment = await UsersDepartment.create(
            {
                department_id: depId,
                created_by: created_by,
                user_id: newUser.user_id,
            },
            { transaction: t }
            );

            // Insert all division IDs under each UsersDepartment
            for (const divId of divisionIds) {
            await UsersDivision.create(
                {
                users_department_id: newUserDepartment.users_department_id,
                division_id: divId,
                created_by: created_by,
                user_id: newUser.user_id,
                },
                { transaction: t }
            );
            }
        }
    }


    // // Create user division (Get user_id from department)
    // await UsersDivision.create({
    //     users_department_id: newUserDepartment.users_departmentS  _id,
    //     division_id: division_id,
    //     created_by: created_by,
    //     user_id: newUserDepartment.user_id
    // }, { transaction: t });

    // Prepare logs for user management log
    const logs = [
        { user_id: newUser.user_id, field: 'name', info: username, at: new Date(), by: created_by },
        { user_id: newUser.user_id, field: 'mobile', info: mobile, at: new Date(), by: created_by },
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
    mobile,
  } = req.body;

  // Validation checks
  if (!username?.trim()) return res.status(400).json({ success: false, message: "Name is required" });
  if (!role_id || role_id === "null") return res.status(400).json({ success: false, message: "Role is required" });
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

    let updatedFields = {};
    let tempUpdatedFields = {};
    if (existingUser.name != username) updatedFields.name = username;

    if (existingUser.role_id != role_id) {
      updatedFields.role_id = role_id;
      tempUpdatedFields.role = role_id;
    }    
    if (existingUser.kgid_id != kgid)
      {
        updatedFields.kgid_id = kgid;
        tempUpdatedFields.kgid = kgid;
        tempUpdatedFields.name = username;
        tempUpdatedFields.mobile = mobile;
      } 

    if (Object.keys(updatedFields).length > 0) {
      await Users.update(updatedFields, { where: { user_id }, transaction: t });

      logs = Object.entries(tempUpdatedFields).map(([field, newValue]) => ({
        user_id,
        field,
        info: `${newValue}`,
        at: new Date(),
        by: created_by,
      }));

      if (logs.length > 0) await UserManagementLog.bulkCreate(logs, { transaction: t });

      if(updatedFields.kgid_id)
      {
        await AuthSecure.update({ kgid_id: kgid }, { where: { user_id }, transaction: t });
      }
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

    // const userDepartment = await UsersDepartment.findOne({ where: { user_id } });
    // if (userDepartment && userDepartment.department_id != department_id) {
    //   await UsersDepartment.update({ department_id }, { where: { user_id }, transaction: t });
    //   await UserManagementLog.create(
    //     { user_id, field: "department", info: `${department_id}`, at: new Date(), by: created_by },
    //     { transaction: t }
    //   );
    // }

    // const users_department_id = userDepartment ? userDepartment.users_department_id : null;
    const divisionIds = (division_id || "")
      .split(",")
      .map((id) => parseInt(id.trim(), 10))
      .filter((id) => !isNaN(id));

    // const existingDivisions = users_department_id
    //   ? await UsersDivision.findAll({ where: { users_department_id } })
    //   : [];
    // const existingDivisionIds = existingDivisions.map((d) => d.division_id);

    // const newDivisions = divisionIds.filter((id) => !existingDivisionIds.includes(id));
    // const removedDivisions = existingDivisionIds.filter((id) => !divisionIds.includes(id));

    // if (newDivisions.length > 0) {
    //   await UsersDivision.bulkCreate(
    //     newDivisions.map((divId) => ({ users_department_id, division_id: divId, created_by, user_id })),
    //     { transaction: t }
    //   );
    //   await UserManagementLog.create(
    //     { user_id, field: "division", info: `${divisionIds}`, at: new Date(), by: created_by },
    //     { transaction: t }
    //   );
    // }
    // if (removedDivisions.length > 0) {
    //   await UsersDivision.destroy({ where: { users_department_id, division_id: removedDivisions }, transaction: t });
    // }

    const newDepartmentIds = (department_id || "").split(",").map((id) => parseInt(id.trim(), 10)).filter((id) => !isNaN(id));

    const existingDepartments = await UsersDepartment.findAll({ where: { user_id } });
    const existingDepartmentIds = existingDepartments.map((d) => d.department_id);

    // Determine departments to add/remove
    const departmentsToAdd = newDepartmentIds.filter((id) => !existingDepartmentIds.includes(id));
    const departmentsToRemove = existingDepartmentIds.filter((id) => !newDepartmentIds.includes(id));

    // Add new departments
    for (const depId of departmentsToAdd) {
    const newDep = await UsersDepartment.create(
        { user_id, department_id: depId, created_by },
        { transaction: t }
    );
    await UserManagementLog.create(
        { user_id, field: "department", info: `Added department ${depId}`, at: new Date(), by: created_by },
        { transaction: t }
    );

        // Add divisions to new department (if needed)
        for (const divId of divisionIds) {
            await UsersDivision.create({ users_department_id: newDep.users_department_id, division_id: divId, created_by, user_id },{ transaction: t });
        }
    }

    // Remove deleted departments
    if (departmentsToRemove.length > 0) {
    const toRemoveRecords = existingDepartments.filter((d) => departmentsToRemove.includes(d.department_id));
    for (const dep of toRemoveRecords) {
        await UsersDivision.destroy({ where: { users_department_id: dep.users_department_id }, transaction: t });
        await UsersDepartment.destroy({ where: { users_department_id: dep.users_department_id }, transaction: t });
        await UserManagementLog.create(
        { user_id, field: "department", info: `Removed department ${dep.department_id}`, at: new Date(), by: created_by },
        { transaction: t }
        );
    }
    }

    // Update divisions for existing departments
    for (const dep of existingDepartments) {
    if (!newDepartmentIds.includes(dep.department_id)) continue; // skip removed

    const users_department_id = dep.users_department_id;

    const existingDivisions = await UsersDivision.findAll({ where: { users_department_id } });
    const existingDivisionIds = existingDivisions.map((d) => d.division_id);

    const newDivisions = divisionIds.filter((id) => !existingDivisionIds.includes(id));
    const removedDivisions = existingDivisionIds.filter((id) => !divisionIds.includes(id));

    if (newDivisions.length > 0) {
        await UsersDivision.bulkCreate(
        newDivisions.map((divId) => ({
            users_department_id,
            division_id: divId,
            created_by,
            user_id,
        })),
        { transaction: t }
        );
    }

    if (removedDivisions.length > 0) {
        await UsersDivision.destroy({
        where: {
            users_department_id,
            division_id: removedDivisions,
        },
        transaction: t,
        });
    }

    if (newDivisions.length > 0 || removedDivisions.length > 0) {
        await UserManagementLog.create(
        {
            user_id,
            field: "division",
            info: `Updated divisions for department ${dep.department_id}: added [${newDivisions}], removed [${removedDivisions}]`,
            at: new Date(),
            by: created_by,
        },
        { transaction: t }
        );
    }
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
  const excluded_role_ids = [1, 2];

  try {
    const {
        page = 1,
        limit = 10,
        sort_by = "created_at",
        order = "DESC",
        search = "",
        filter = {},
        from_date = null,
        to_date = null
    } = req.body;

    const offset = (page - 1) * limit;
    
    const andConditions = [];

    // Filter conditions (AND)
    if (filter.role_id) andConditions.push({ role_id: filter.role_id });

    // if (filter.department_id) {
    //   if (Array.isArray(filter.department_id)) {
    //     andConditions.push({ "$users_departments.department_id$": { [Op.in]: filter.department_id } });
    //   } else {
    //     andConditions.push({ "$users_departments.department_id$": filter.department_id });
    //   }
    // }

    // if (filter.division_id) {
    //   if (Array.isArray(filter.division_id)) {
    //     andConditions.push({ "$users_division.division_id$": { [Op.in]: filter.division_id } });
    //   } else {
    //     andConditions.push({ "$users_division.division_id$": filter.division_id });
    //   }
    // }

    // if (filter.designation_id) andConditions.push({ "$users_designations.designation_id$": filter.designation_id });
    if (filter.designation_id) {
      if (Array.isArray(filter.designation_id)) {
        andConditions.push({ "$users_designations.designation_id$": { [Op.in]: filter.designation_id } });
      } else {
        andConditions.push({ "$users_designations.designation_id$": filter.designation_id });
      }
    }
    if (filter.dev_status !== undefined) andConditions.push({ dev_status: filter.dev_status });

    if (filter.kgid) andConditions.push({ "$kgidDetails.id$": filter.kgid });
    // if (filter.name) andConditions.push({ "$kgidDetails.name$": filter.name });
    // if (filter.mobile) andConditions.push({ "$kgidDetails.mobile$": filter.mobile });

    // Date filter
    if (from_date || to_date) {
      const createdAt = {};
      if (from_date) createdAt[Op.gte] = new Date(`${from_date}T00:00:00.000Z`);
      if (to_date) createdAt[Op.lte] = new Date(`${to_date}T23:59:59.999Z`);
      andConditions.push({ created_at: createdAt });
    }

    // Search conditions (OR)
    if (search) {
      const searchConditions = [
        { "$kgidDetails.name$": { [Op.iLike]: `%${search}%` } },
        { "$kgidDetails.kgid$": { [Op.iLike]: `%${search}%` } },
        { "$kgidDetails.mobile$": { [Op.iLike]: `%${search}%` } },
        { "$role.role_title$": { [Op.iLike]: `%${search}%` } },
        { "$users_designations.designation.designation_name$": { [Op.iLike]: `%${search}%` } },
        { "$users_departments.department.department_name$": { [Op.iLike]: `%${search}%` } },
        { "$users_division.division.division_name$": { [Op.iLike]: `%${search}%` } }
      ];
      andConditions.push({ [Op.or]: searchConditions });
    }

    // Final WHERE clause
    const finalWhere = andConditions.length > 0 ? { [Op.and]: andConditions } : {};

    const roleWhere = {
      role_id: { [Op.notIn]: excluded_role_ids },
    };

    const includeFull = [
      {
        model: Role,
        as: "role",
        attributes: ["role_id", "role_title"],
        required: true,
        where: roleWhere,
      },
      {
        model: KGID,
        as: "kgidDetails",
        attributes: ["id","kgid", "name", "mobile"],
        required: false,
      },
      {
        model: UserDesignation,
        as: "users_designations",
        attributes: ["designation_id"],
        required: false,
        include: [
          {
            model: Designation,
            as: "designation",
            attributes: ["designation_id","designation_name"],
          },
        ],
      },
      {
        model: UsersDepartment,
        as: "users_departments",
        attributes: ["department_id"],
        required: false,
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
        required: false,
        include: [
          {
            model: Division,
            as: "division",
            attributes: ["division_name"],
          },
        ],
      },
    ];

    const { rows: userRows, count: totalItems } = await Users.findAndCountAll({
      attributes: ["user_id", "role_id", "dev_status"],
      include: includeFull,
      where: finalWhere,
      order: [[sort_by, order]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true,
      subQuery: false,
    });

    // const users = userRows.map(u => u.user_id);
    const users = userRows;

    if (users.length === 0) {
      return res.status(200).json({
        users: [],
        meta: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalItems: 0,
          totalPages: 0,
          order,
        },
      });
    }

    const totalPages = Math.ceil(totalItems / limit);

    return res.status(200).json({
      users,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalItems,
        totalPages,
        order,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

// exports.filter_users = async (req, res) => {
//   const {
//     searchvalue,
//     name,
//     kgid,
//     role_id,
//     mobile,
//     department_id,
//     division_id,
//     designation_id,
//     dev_status,
//   } = req.body;

//   try {
//     console.log("Received Filters:", req.body);

//     const orConditions = [];

//     if (searchvalue) {
//       orConditions.push(
//         { "$kgidDetails.name$": { [Op.iLike]: `%${searchvalue}%` } },
//         { "$kgidDetails.kgid$": { [Op.iLike]: `%${searchvalue}%` } },
//         { "$kgidDetails.mobile$": { [Op.iLike]: `%${searchvalue}%` } },
//         { "$role.role_title$": { [Op.iLike]: `%${searchvalue}%` } },
//         { "$users_designations.designation.designation_name$": { [Op.iLike]: `%${searchvalue}%` } },
//         { "$users_departments.department.department_name$": { [Op.iLike]: `%${searchvalue}%` } },
//         { "$users_division.division.division_name$": { [Op.iLike]: `%${searchvalue}%` } }
//       );
//     }

//     // if (kgid) orConditions.push({ kgid: { [Op.iLike]: `%${kgid}%` } });
//     if (role_id) orConditions.push({ role_id });
//     if (department_id)
//       orConditions.push({ "$users_departments.department_id$": department_id });
//     if (division_id)
//       orConditions.push({ "$users_division.division_id$": division_id });
//     if (designation_id)
//       orConditions.push({
//         "$users_designations.designation_id$": designation_id,
//       });
//     if (dev_status !== undefined) orConditions.push({ dev_status });
//     if (kgid) {
//       orConditions.push({ "$kgidDetails.kgid$": kgid },
//         { "$kgidDetails.name$": name },
//         { "$kgidDetails.mobile$": mobile }

//       );
//     }
//     const filters = orConditions.length > 0 ? { [Op.or]: orConditions } : {}; // Apply OR condition

//     console.log("Final Filters:", filters);
//     const excluded_role_ids = [1, 10, 21];

//     const users = await Users.findAll({
//       include: [
//         {
//           model: Role,
//           as: "role",
//           attributes: ["role_id", "role_title"],
//           where: {
//             role_id: {
//               [Op.notIn]: excluded_role_ids,
//             },
//           },
//         },
//         {
//           model: KGID,
//           as: "kgidDetails",
//           attributes: ["kgid", "name", "mobile"],
//         },
//         {
//           model: UserDesignation,
//           as: "users_designations",
//           attributes: ["designation_id"],
//           include: [
//             {
//               model: Designation,
//               as: "designation",
//               attributes: ["designation_name"],
//             },
//           ],
//         },
//         {
//           model: UsersDepartment,
//           as: "users_departments",
//           attributes: ["department_id"],
//           include: [
//             {
//               model: Department,
//               as: "department",
//               attributes: ["department_name"],
//             },
//           ],
//         },
//         {
//           model: UsersDivision,
//           as: "users_division",
//           attributes: ["division_id"],
//           include: [
//             { model: Division, as: "division", attributes: ["division_name"] },
//           ],
//         },
//       ],
//       where: filters,
//       attributes: ["user_id", "role_id", "dev_status"],
//     });

//     return res.status(200).json({ users });
//   } catch (error) {
//     console.error("Error filtering users:", error);
//     return res
//       .status(500)
//       .json({ message: "Failed to filter users", error: error.message });
//   }
// };

// Function to get user management logs

exports.filter_users = async (req, res) => {
  const {
    searchvalue,
    name,
    kgid,
    role_id,
    mobile,
    department_id,
    division_id,
    designation_id,
    dev_status,
    page = 1,
    limit = 10,
    sort_by = "created_at",
    order = "DESC",
  } = req.body;

  try {
    const offset = (page - 1) * limit;
    const excluded_role_ids = [1];

    const orConditions = [];

    if (searchvalue) {
      orConditions.push(
        { "$kgidDetails.name$": { [Op.iLike]: `%${searchvalue}%` } },
        { "$kgidDetails.kgid$": { [Op.iLike]: `%${searchvalue}%` } },
        { "$kgidDetails.mobile$": { [Op.iLike]: `%${searchvalue}%` } },
        { "$role.role_title$": { [Op.iLike]: `%${searchvalue}%` } },
        { "$users_designations.designation.designation_name$": { [Op.iLike]: `%${searchvalue}%` } },
        { "$users_departments.department.department_name$": { [Op.iLike]: `%${searchvalue}%` } },
        { "$users_division.division.division_name$": { [Op.iLike]: `%${searchvalue}%` } }
      );
    }

    if (role_id) orConditions.push({ role_id });
    if (department_id) orConditions.push({ "$users_departments.department_id$": department_id });
    if (division_id) orConditions.push({ "$users_division.division_id$": division_id });
    if (designation_id) orConditions.push({ "$users_designations.designation_id$": designation_id });
    if (dev_status !== undefined) orConditions.push({ dev_status });

    if (kgid) {
      if (kgid) orConditions.push({ "$kgidDetails.kgid$": kgid });
      if (name) orConditions.push({ "$kgidDetails.name$": name });
      if (mobile) orConditions.push({ "$kgidDetails.mobile$": mobile });
    }

    const filters = orConditions.length > 0 ? { [Op.or]: orConditions } : {};


    console.log("############################################## filters",filters);

    const { rows: users, count: totalItems } = await Users.findAndCountAll({
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
          model: KGID,
          as: "kgidDetails",
          attributes: ["kgid", "name", "mobile"],
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
            { model: Division, as: "division", attributes: ["division_name"] },
          ],
        },
      ],
      where: filters,
      attributes: ["user_id", "role_id", "dev_status"],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sort_by, order]],
      distinct: true,
      subQuery: false,
    });

    const totalPages = Math.ceil(totalItems / limit);

    return res.status(200).json({
      users,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalItems,
        totalPages,
        order,
      },
    });
  } catch (error) {
    console.error("Error filtering users:", error);
    return res
      .status(500)
      .json({ message: "Failed to filter users", error: error.message });
  }
};


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

        if (field === 'kgid') {
            // Extract department IDs from the logs
            const kgidIds = logs.map(log => log.info);

            // Fetch department names based on the department IDs
            const kgidId = await KGID.findAll({
               attributes:['id','kgid'],
                where: {
                    id: kgidIds
                }
            });

            // Create a mapping of department IDs to department names
            const kgidMap = {};
            kgidId.forEach(kgid => {
                kgidMap[kgid.id] = kgid.kgid;
            });

            // Combine logs with kgid names
            const formattedLogs = logs.map(log => ({
                ...log.dataValues,
                info: kgidMap[log.info] || 'Unknown KGID' 
            }));

            // Return the logs with role names
            return res.status(200).json({"logs":formattedLogs});
        }

        // Return the logs as a response
        return res.status(200).json({"logs":logs});
    } catch (error) {
        console.error('Error fetching user management logs:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
