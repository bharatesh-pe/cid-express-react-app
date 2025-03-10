const express = require('express');
const templateStarController = require('../controllers/templateStarController');
const userAuthMiddleware = require('../middleware/userAuthMiddleware');
const router = express.Router();


router.post('/toggleTemplateStar', userAuthMiddleware, templateStarController.toggleTemplateStar);



module.exports = router;