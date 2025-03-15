const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const roleRoutes = require('./roleRoutes');
const repositoryRoutes = require('./repositoryRoutes');
const templateRoutes = require('./templateRoutes');
const approvalLogsRoutes = require('./approvalLogsRoutes');
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/role', roleRoutes);
router.use('/repository', repositoryRoutes);
router.use('/templates', templateRoutes);
router.use("/ui_case",approvalLogsRoutes)
module.exports = router;