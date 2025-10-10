const { Op } = require('sequelize');
const User = require('../models/User');
const UserApplication = require('../models/UserApplication');
const Application = require('../models/Application');

// Get all users with their applications and search support
exports.getAllUsers = async (req, res) => {
    try {
        const offset = parseInt(req.query.offset, 10) || 0;
        const limit = parseInt(req.query.limit, 10) || 20;
        const search = req.query.search || '';

        // Build where clause for search
        let where = {};
        if (search) {
            where = {
                [Op.or]: [
                    { user_name: { [Op.like]: `%${search}%` } },
                    { mobile_number: { [Op.like]: `%${search}%` } }
                ]
            };
        }

        const { count, rows: users } = await User.findAndCountAll({
            where,
            offset,
            limit,
            include: [
                {
                    model: UserApplication,
                    as: 'userApplications',
                    attributes: ['applicationCode']
                }
            ]
        });

        res.json({
            users,
            total: count
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch users', error: err.message });
    }
};

// Add a new user
exports.addUser = async (req, res) => {
    try {
        const { username, mobile, designation, isActive, applications } = req.body;
        const user = await User.create({ username, mobile, designation, isActive });
        if (applications && applications.length > 0) {
            const appRecords = await Application.findAll({ where: { code: applications } });
            await user.setApplications(appRecords);
        }
        res.status(201).json(user);
    } catch (err) {
        res.status(500).json({ message: 'Failed to add user', error: err.message });
    }
};

// Edit user
exports.editUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { user_name, mobile_number, isActive, applications } = req.body;
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await user.update({ user_name, mobile_number, isActive });

        if (Array.isArray(applications)) {
            // Validate codes
            const appRecords = await Application.findAll({ where: { code: applications } });
            const validCodes = appRecords.map(app => app.code);
            const invalidCodes = applications.filter(code => !validCodes.includes(code));
            if (invalidCodes.length > 0) {
                return res.status(400).json({
                    message: 'Some application codes are invalid',
                    invalidCodes
                });
            }

            // Remove old user_applications
            await UserApplication.destroy({ where: { userId: user.id } });

            // Add new user_applications
            const newUserApps = validCodes.map(code => ({
                userId: user.id,
                applicationCode: code
            }));
            await UserApplication.bulkCreate(newUserApps);
        }

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Failed to update user', error: err.message });
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        await user.destroy();
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete user', error: err.message });
    }
};