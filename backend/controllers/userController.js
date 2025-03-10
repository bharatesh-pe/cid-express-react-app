const { Sequelize } = require('sequelize');
const sequelize = require('../config/dbConfig');
const { UsersDepartment, UsersDivision, UserDesignation, Users, AuthSecure } = require('../models');

// Create user
exports.create_user = async (req, res) => {
    const { username, role_id, kgid, pin, designation_id, department_id, division_id, created_by } = req.body;

    const t = await sequelize.transaction();

    try {
        // Check if the user exists
        const existingUser = await Users.findOne({ where: { kgid: kgid } });
        if (existingUser) {
            await t.rollback();
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user
        const newUser = await Users.create({
            name: username,
            role_id: role_id,
            kgid: kgid,
            created_by: created_by
        }, { transaction: t });

        // Create auth secure
        const newAuthSecure = await AuthSecure.create({
            user_id: newUser.user_id,
            kgid: kgid,
            pin: pin
        }, { transaction: t });

        // Create user designation
        const newUserDesignation = await UserDesignation.create({
            user_id: newUser.user_id,
            designation_id: designation_id,
            created_by: created_by
        }, { transaction: t });

        // Create user department
        const newUserDepartment = await UsersDepartment.create({
            user_id: newUser.user_id,
            department_id: department_id,
            created_by: created_by
        }, { transaction: t });

        // Create user division
        const newUserDivision = await UsersDivision.create({
            user_department_id: newUserDepartment.user_department_id,
            division_id: division_id,
            created_by: created_by,
            user_id: newUser.user_id
        }, { transaction: t });

        await t.commit();

        return res.status(201).json({ message: 'User created successfully' });

    } catch (error) {
        await t.rollback();
        console.error('Error creating user:', error.message);
        return res.status(500).json({ message: 'Failed to create user', error: error.message });
    }
};

// Update user
exports.update_user = async (req, res) => {
    const { user_id, username, role_id, kgid, pin, designation_id, department_id, division_id, updated_by } = req.body;

    const t = await sequelize.transaction();

    try {
        // Check if the user exists
        const existingUser = await Users.findOne({ where: { user_id: user_id } });
        if (!existingUser) {
            await t.rollback();
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user
        await existingUser.update({
            name: username,
            role_id: role_id,
            kgid: kgid,
            updated_by: updated_by
        }, { transaction: t });

        // Update auth secure
        const existingAuthSecure = await AuthSecure.findOne({ where: { user_id: user_id } });
        if (existingAuthSecure) {
            await existingAuthSecure.update({
                kgid: kgid,
                pin: pin
            }, { transaction: t });
        }

        // Update user designation
        const existingUserDesignation = await UserDesignation.findOne({ where: { user_id: user_id } });
        if (existingUserDesignation) {
            await existingUserDesignation.update({
                designation_id: designation_id,
                updated_by: updated_by
            }, { transaction: t });
        }

        // Update user department
        const existingUserDepartment = await UsersDepartment.findOne({ where: { user_id: user_id } });
        if (existingUserDepartment) {
            await existingUserDepartment.update({
                department_id: department_id,
                updated_by: updated_by
            }, { transaction: t });
        }

        // Update user division
        const existingUserDivision = await UsersDivision.findOne({ where: { user_id: user_id } });
        if (existingUserDivision) {
            await existingUserDivision.update({
                division_id: division_id,
                updated_by: updated_by
            }, { transaction: t });
        }

        await t.commit();

        return res.status(200).json({ message: 'User updated successfully' });

    } catch (error) {
        await t.rollback();
        console.error('Error updating user:', error.message);
        return res.status(500).json({ message: 'Failed to update user', error: error.message });
    }
};