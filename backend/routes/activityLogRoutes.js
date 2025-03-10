const express = require('express');
const activityLogController = require('../controllers/activityLogController');
const userAuthMiddleware = require('../middleware/userAuthMiddleware');
const router = express.Router();


router.post('/getActivityLog', userAuthMiddleware, activityLogController.getActivityLog)
router.post('/paginateActivityLog', userAuthMiddleware, activityLogController.paginateActivityLog)
module.exports = router;