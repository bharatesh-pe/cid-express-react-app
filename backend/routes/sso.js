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
// @desc    Validate SSO token using tokenId (for external applications)
// @access  Public
router.post('/validate',
  [
    body('tokenId')
      .notEmpty()
      .withMessage('Token ID is required')
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

// @route   POST /api/sso/generate-encrypted-token
// @desc    Generate encrypted token for mobile number and source
// @access  Private
router.post('/generate-encrypted-token',
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

      await SSOController.generateEncryptedToken(req, res);
    } catch (error) {
      console.error('Generate encrypted token route error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

// @route   POST /api/sso/validate-encrypted-token
// @desc    Validate encrypted token using tokenId (for external applications)
// @access  Public
router.post('/validate-encrypted-token',
  [
    body('tokenId')
      .notEmpty()
      .withMessage('Token ID is required')
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

      await SSOController.validateEncryptedToken(req, res);
    } catch (error) {
      console.error('Validate encrypted token route error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

// @route   POST /api/sso/get-token
// @desc    Get token metadata by tokenId (secure transmission)
// @access  Public
router.post('/get-token',
  [
    body('tokenId')
      .notEmpty()
      .withMessage('Token ID is required')
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

      await SSOController.getTokenById(req, res);
    } catch (error) {
      console.error('Get token by ID route error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

// @route   POST /api/sso/cleanup-tokens
// @desc    Cleanup expired tokens
// @access  Private (Admin only)
router.post('/cleanup-tokens',
  auth,
  async (req, res) => {
    try {
      await SSOController.cleanupExpiredTokens(req, res);
    } catch (error) {
      console.error('Cleanup tokens route error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

// @route   GET /api/sso/user-tokens
// @desc    Get active tokens for authenticated user
// @access  Private
router.get('/user-tokens',
  auth,
  async (req, res) => {
    try {
      await SSOController.getUserTokens(req, res);
    } catch (error) {
      console.error('Get user tokens route error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

// @route   POST /api/sso/revoke-token
// @desc    Revoke a specific token
// @access  Private
router.post('/revoke-token',
  auth,
  [
    body('tokenId')
      .notEmpty()
      .withMessage('Token ID is required')
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

      await SSOController.revokeToken(req, res);
    } catch (error) {
      console.error('Revoke token route error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

// @route   POST /api/sso/validate-token-id
// @desc    Validate tokenId for external applications (Vue.js app)
// @access  Public
router.post('/validate-token-id',
  [
    body('tokenId')
      .notEmpty()
      .withMessage('Token ID is required')
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

      await SSOController.validateTokenId(req, res);
    } catch (error) {
      console.error('Validate tokenId route error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

module.exports = router;
