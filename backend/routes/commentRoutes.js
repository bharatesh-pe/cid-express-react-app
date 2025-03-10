const express = require('express');
const commentController = require('../controllers/commentController');
const userAuthMiddleware = require('../middleware/userAuthMiddleware');
const router = express.Router();


router.post('/createComment', userAuthMiddleware, commentController.createComment);
router.post('/updateComment', userAuthMiddleware, commentController.updateComment);
router.post('/deleteComment', userAuthMiddleware, commentController.deleteComment);
router.post('/viewComment', userAuthMiddleware, commentController.viewComment);
router.post('/getComments', userAuthMiddleware, commentController.getComments);
router.post('/paginateComments', userAuthMiddleware, commentController.paginateComments);


module.exports = router;