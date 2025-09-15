const express = require('express');
const { body, validationResult } = require('express-validator');
const SSOController = require('../controllers/SSOController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/sso/generate/:applicationCode
// @desc    Generate SSO token for external application
// @access  Private
router.post('/generate/:applicationCode',
  auth,
  [
    body('applicationCode')
      .notEmpty()
      .withMessage('Application code is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      await SSOController.generateSSOToken(req, res);
    } catch (error) {
      console.error('Generate SSO token route error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

// @route   POST /api/sso/validate
// @desc    Validate SSO token (for external applications)
// @access  Public
router.post('/validate',
  [
    body('token')
      .notEmpty()
      .withMessage('Token is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      await SSOController.validateSSOToken(req, res);
    } catch (error) {
      console.error('Validate SSO token route error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

module.exports = router;
