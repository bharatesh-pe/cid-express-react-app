const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const roleRoutes = require('./roleRoutes');
const repositoryRoutes = require('./repositoryRoutes');
// const mastersRoutes = require('./mastersRoutes');

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/role', roleRoutes);
router.use('/repository', repositoryRoutes);
// router.use('/master', mastersRoutes);

module.exports = router;