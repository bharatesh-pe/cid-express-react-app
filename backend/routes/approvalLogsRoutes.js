const express = require('express');

const userAuthMiddleware = require('../middleware/userAuthMiddleware');
const { getApprovalLogs } = require('../controllers/approvalLogsController');

const router = express.Router();

router.post('/add_approval', userAuthMiddleware, getApprovalLogs)

module.exports = router;