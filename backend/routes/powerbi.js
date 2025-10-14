const express = require('express');
const router = express.Router();
const PowerBIController = require('../controllers/PowerBIController');
const { auth } = require('../middleware/auth');

// Apply authentication middleware to all PowerBI routes
router.use(auth);

/**
 * @route   GET /api/powerbi/config
 * @desc    Get Power BI report configuration
 * @access  Private
 */
router.get('/config', PowerBIController.getReportConfig);

/**
 * @route   POST /api/powerbi/access-token
 * @desc    Get Power BI access token
 * @access  Private
 */
router.post('/access-token', PowerBIController.getAccessToken);

/**
 * @route   POST /api/powerbi/embed-token
 * @desc    Get Power BI embed token for report embedding
 * @access  Private
 */
router.post('/embed-token', PowerBIController.getEmbedToken);

module.exports = router;
