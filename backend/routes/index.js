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
const casesActionRoutes = require('./casesActionRoutes');
const uiCaseApprovalRoutes = require('./uiApprovalRoutes');
const profileHistoryRoutes = require('./profileHistoryRoutes');
const chargesheet = require('./chargesheet');
const alertCronJob = require('../controllers/alertCronJob');
const importOldDBRoute = require('./importOldDBRoute');
const powerBiRoutes = require('./powerBiRoutes');

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/role', roleRoutes);
router.use('/repository', repositoryRoutes);
router.use('/templates', templateRoutes);
router.use('/templateData', templateDataRoutes);
router.use('/cidMaster', cidMasterRoutes);
router.use('/master', masterRoutes);
router.use('/master_meta', master_metaRoutes);
router.use('/action', casesActionRoutes);
router.use('/ui_approval', uiCaseApprovalRoutes);
router.use('/profileHistories', profileHistoryRoutes);
router.use('/chargeSheet', chargesheet);
router.use('/import', importOldDBRoute);
router.use('/powerBi', powerBiRoutes);

// New route to trigger refresh of alert cron jobs from frontend
router.post('/refresh_alert_cron', alertCronJob.refreshAlertCron);

module.exports = router;