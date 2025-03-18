const fs = require('fs');
const path = require('path');
const { Sequelize } = require("sequelize");
const dbConfig = require("../config/dbConfig");
const {Role ,  UsersDepartment, UsersDivision, UserDesignation, Users, AuthSecure , Designation , Department , Division } = require("../models");
const { Op } = require('sequelize');

// Initialize Sequelize
const sequelize = new Sequelize(dbConfig.database.database, dbConfig.database.username, dbConfig.database.password, {
    host: dbConfig.database.host,
    port: dbConfig.database.port,
    dialect: dbConfig.database.dialect
});

// Create user
exports.create_user = async (req, res) => {
    const { username, role_id, kgid, pin, designation_id, department_id, division_id, created_by ,transaction_id } = req.body;
    
    // Username validation
    if (!username || !username.trim() || username == null || username == "null"  || username == undefined) {
        return res.status(400).json({
            success: false,
            message: "Name is required"
        });
    }

    // Role ID validation
    if (!role_id || role_id == null  || role_id == "null" || role_id == undefined) {
        return res.status(400).json({
            success: false,
            message: "Role is required"
        });
    }

    // KGID validation
    if (!kgid || !kgid.trim() || kgid == null || kgid == "null" || kgid == undefined) {
        return res.status(400).json({
            success: false,
            message: "KGID is required"
        });
    }

    // Designation ID validation
    if (!designation_id || designation_id == null  || designation_id == "null" || designation_id == undefined) {
        return res.status(400).json({
            success: false,
            message: "Designation is required"
        });
    }

    // Department ID validation
    if (!department_id || department_id == null || department_id == "null"  || department_id == undefined) {
        return res.status(400).json({
            success: false,
            message: "Department is required"
        });
    }

    // Division ID validation
    if (!division_id || division_id == null  || division_id == "null"  || division_id == undefined) {
        return res.status(400).json({
            success: false,
            message: "Division is required"
        });
    }

    // PIN validation
    if (!pin || !pin.trim() || pin == null || pin == "null" || pin == undefined) {
        return res.status(400).json({
            success: false,
            message: "PIN is required"
        });
    }

    if(!transaction_id || transaction_id == "")
    {
        return res.status(400).json({ success: false, message: "Transaction Id is required!" });
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

    const t = await sequelize.transaction();

    try {
        // Check if user already exists
        const existingUser = await Users.findOne({ where: { kgid: kgid } });
        if (existingUser) {
            await t.rollback();
            return res.status(400).json({ message: "User already exists" });
        }

        // Create user
        const newUser = await Users.create({
            name: username,
            role_id: role_id,
            kgid: kgid,
            created_by: created_by
        }, { transaction: t });

        // Create auth secure
        await AuthSecure.create({
            user_id: newUser.user_id,
            kgid: kgid,
            pin: pin
        }, { transaction: t });

        // Create user designation
        const designationIds = designation_id.includes(",")
        ? designation_id.split(",").map(id => parseInt(id.trim(), 10))
        : [parseInt(designation_id, 10)];
        for (const desigId of designationIds) {
            await UserDesignation.create({
                user_id: newUser.user_id,
                designation_id: desigId,
                created_by: created_by
            }, { transaction: t });
        }
            
        // Create user department
        const newUserDepartment = await UsersDepartment.create({
            user_id: newUser.user_id,
            department_id: department_id,
            created_by: created_by
        }, { transaction: t });

        // // Create user division (Get user_id from department)
        // await UsersDivision.create({
        //     users_department_id: newUserDepartment.users_department_id,
        //     division_id: division_id,
        //     created_by: created_by,
        //     user_id: newUserDepartment.user_id
        // }, { transaction: t });

        // Convert division_id to an array (similar to designation handling)
        const divisionIds = division_id.includes(",")
            ? division_id.split(",").map(id => parseInt(id.trim(), 10))
            : [parseInt(division_id, 10)];

        // Insert new divisions
        for (const divId of divisionIds) {
            await UsersDivision.create({
                users_department_id: newUserDepartment.users_department_id,
                division_id: divId,
                created_by: created_by,
                user_id: newUserDepartment.user_id
            }, { transaction: t });
        }

        await t.commit();
        return res.status(201).json({ success: true, message: "User created successfully" });

    } catch (error) {
        if (t.finished !== "rollback") {
            await t.rollback();
        }
        console.error("Error creating user:", error);
        return res.status(500).json({ message: "Failed to create user", error: error.message });
    }
    finally {
        if (fs.existsSync(dirPath)) {
        fs.rmdirSync(dirPath, { recursive: true });
        }
    }
};

exports.update_user = async (req, res) => {
    const { user_id, username, role_id, kgid, designation_id, department_id, division_id , created_by , transaction_id} = req.body;

    // Username validation
    if (!username || !username.trim() || username == null || username == "null"  || username == undefined) {
        return res.status(400).json({
            success: false,
            message: "Name is required"
        });
    }

    // Role ID validation
    if (!role_id || role_id == null  || role_id == "null" || role_id == undefined) {
        return res.status(400).json({
            success: false,
            message: "Role is required"
        });
    }

    // KGID validation
    if (!kgid || !kgid.trim() || kgid == null || kgid == "null" || kgid == undefined) {
        return res.status(400).json({
            success: false,
            message: "KGID is required"
        });
    }

    // Designation ID validation
    if (!designation_id || designation_id == null  || designation_id == "null" || designation_id == undefined) {
        return res.status(400).json({
            success: false,
            message: "Designation is required"
        });
    }

    // Department ID validation
    if (!department_id || department_id == null || department_id == "null"  || department_id == undefined) {
        return res.status(400).json({
            success: false,
            message: "Department is required"
        });
    }

    // Division ID validation
    if (!division_id || division_id == null  || division_id == "null"  || division_id == undefined) {
        return res.status(400).json({
            success: false,
            message: "Division is required"
        });
    }
    
    if(!transaction_id || transaction_id == "")
    {
        return res.status(400).json({ success: false, message: "Transaction Id is required!" });
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

    const t = await sequelize.transaction();

    try {
        // Check if the user exists
        const existingUser = await Users.findOne({ where: { user_id: user_id } });
        if (!existingUser) {
            await t.rollback();
            return res.status(404).json({ message: "User not found" });
        }

        // Update user details
        await Users.update(
            {
                name: username,
                role_id: role_id,
                kgid: kgid
            },
            { where: { user_id: user_id }, transaction: t }
        );

        // Update auth secure details
        // await AuthSecure.update(
        //     { pin: pin },
        //     { where: { user_id: user_id }, transaction: t }
        // );

        // Convert designation_id to an array
        const designationIds = designation_id.includes(",")
            ? designation_id.split(",").map(id => parseInt(id.trim(), 10))
            : [parseInt(designation_id, 10)];

        // Remove existing designations for the user
        await UserDesignation.destroy({ where: { user_id }, transaction: t });

        // Insert new designations
        for (const desigId of designationIds) {
            await UserDesignation.create({
                user_id: user_id,
                created_by:created_by,
                designation_id: desigId,
            }, { transaction: t });
        }


        // Update user department
        const userDepartment = await UsersDepartment.findOne({ where: { user_id: user_id } });
        if (userDepartment) {
            await UsersDepartment.update(
                { department_id: department_id },
                { where: { user_id: user_id }, transaction: t }
            );

            // Update user division
            // await UsersDivision.update(
            //     { division_id: division_id },
            //     { where: { users_department_id: userDepartment.users_department_id }, transaction: t }
            // );
             const divisionIds = division_id.includes(",")
            ? division_id.split(",").map(id => parseInt(id.trim(), 10))
            : [parseInt(division_id, 10)];

            const users_department_id = userDepartment.users_department_id;

            // Remove existing designations for the user
            await UsersDivision.destroy({ where: { users_department_id }, transaction: t });

            // Insert new divisions
            for (const divId of divisionIds) {
                await UsersDivision.create({
                    users_department_id: userDepartment.users_department_id,
                    division_id: divId,
                    created_by:created_by,
                    user_id: userDepartment.user_id
                }, { transaction: t });
            }

        }

        await t.commit();
        return res.status(201).json({ success: true, message: "User updated successfully" });

    } catch (error) {
        if (t.finished !== "rollback") {
            await t.rollback();
        }
        console.error("Error updating user:", error);
        return res.status(500).json({ message: "Failed to update user", error: error.message });
    }
    finally {
        if (fs.existsSync(dirPath)) {
        fs.rmdirSync(dirPath, { recursive: true });
        }
    }
};

exports.user_active_deactive = async (req, res) => {
    const { user_id, dev_status ,transaction_id } = req.body; // dev_status should be true or false

    if(!transaction_id || transaction_id == "")
    {
        return res.status(400).json({ success: false, message: "Transaction Id is required!" });
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

    const t = await sequelize.transaction();

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
        return res.status(200).json({success: true, message: `User ${dev_status ? "activated" : "deactivated"} successfully` });

    } catch (error) {
        if (t.finished !== "rollback") {
            await t.rollback();
        }
        console.error("Error updating user status:", error);
        return res.status(500).json({ message: "Failed to update user status", error: error.message });
    }
    finally {
        if (fs.existsSync(dirPath)) {
        fs.rmdirSync(dirPath, { recursive: true });
        }
    }
};

exports.get_users = async (req, res) => {
    const excluded_role_ids = [1, 10 ,21]; 
    try {
        const users = await Users.findAll({
            include: [
                 {
                    model: Role,
                    as: "role",
                    attributes: ["role_id","role_title"],
                    where: {
                        role_id: {
                        [Op.notIn]: excluded_role_ids
                        }
                    }
                },
                {
                    model: UserDesignation,
                    as: "users_designations",
                    attributes: ["designation_id"],
                    include: [
                        {
                            model: Designation,
                            as: "designation",
                            attributes: ["designation_name"]
                        }
                    ]
                },
                {
                    model: UsersDepartment,
                    as: "users_departments",
                    attributes: ["department_id"],
                    include: [
                        {
                            model: Department,
                            as: "department",
                            attributes: ["department_name"]
                        }
                    ]
                },
                {
                    model: UsersDivision,
                    as: "users_division",
                    attributes: ["division_id"],
                    include: [
                        {
                            model: Division,
                            as: "division",
                            attributes: ["division_name"]
                        }
                    ]
                }
            ],
            attributes: ["user_id", "name", "role_id", "kgid", "dev_status"]
        });

        return res.status(200).json({ users });

    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({ message: "Failed to fetch users", error: error.message });
    }
};

exports.filter_users = async (req, res) => {
    const { name, kgid, role_id, department_id, division_id, designation_id, dev_status } = req.body;

    try {
        console.log("Received Filters:", req.body);

        const orConditions = [];

        if (name) orConditions.push({ name: { [Op.iLike]: `%${name}%` } });
        if (kgid) orConditions.push({ kgid });
        if (role_id) orConditions.push({ role_id });
        if (department_id) orConditions.push({ "$users_departments.department_id$": department_id });
        if (division_id) orConditions.push({ "$users_division.division_id$": division_id });
        if (designation_id) orConditions.push({ "$users_designations.designation_id$": designation_id });
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
                    include: [{ model: Designation, as: "designation", attributes: ["designation_name"] }]
                },
                {
                    model: UsersDepartment,
                    as: "users_departments",
                    attributes: ["department_id"],
                    include: [{ model: Department, as: "department", attributes: ["department_name"] }]
                },
                {
                    model: UsersDivision,
                    as: "users_division",
                    attributes: ["division_id"],
                    include: [{ model: Division, as: "division", attributes: ["division_name"] }]
                }
            ],
            where: filters,
            attributes: ["user_id", "name", "role_id", "kgid", "dev_status"]
        });

        return res.status(200).json({ users });

    } catch (error) {
        console.error("Error filtering users:", error);
        return res.status(500).json({ message: "Failed to filter users", error: error.message });
    }
};
