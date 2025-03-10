const express = require('express');
const profileLeaderController = require('../controllers/profileLeaderController');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');
const router = express.Router();


router.post('/addProfileLeader', profileLeaderController.addProfileLeader);
router.post('/updateProfileLeader', profileLeaderController.updateProfileLeader);
router.post('/viewProfileLeader', profileLeaderController.viewProfileLeader);


module.exports = router;