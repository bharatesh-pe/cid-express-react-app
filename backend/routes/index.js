const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const roleRoutes = require('./roleRoutes');
const repositoryRoutes = require('./repositoryRoutes');
const templateRoutes = require('./templateRoutes');
const templateDataRoutes = require('./templateDataRoutes');
const cidMasterRoutes = require('./cidMasterRoutes')
const masterRoutes = require('./mastersRoute');
const master_metaRoutes = require('./master_metaRoute');
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/role', roleRoutes);
router.use('/repository', repositoryRoutes);
router.use('/templates', templateRoutes);
router.use('/templateData', templateDataRoutes);
router.use('/cidMaster', cidMasterRoutes);
router.use('/master', masterRoutes);
router.use('/master_meta', master_metaRoutes);

module.exports = router;