const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const AuthController = require('../controllers/AuthController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Rate limiting for OTP requests
const otpRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 requests per windowMs
  message: {
    success: false,
    message: 'Too many OTP requests. Please try again after 15 minutes.'
  }
});

// Rate limiting for OTP verification
const verifyRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // limit each IP to 5 verification attempts per windowMs
  message: {
    success: false,
    message: 'Too many verification attempts. Please try again after 5 minutes.'
  }
});

// Rate limiting for direct login
const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 login attempts per windowMs
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.'
  }
});

// @route   POST /api/auth/send-otp
// @desc    Send OTP to mobile number
// @access  Public
router.post('/send-otp', 
  otpRateLimit,
  [
    body('mobile_number')
      .isLength({ min: 10, max: 10 })
      .withMessage('Mobile number must be exactly 10 digits')
      .matches(/^[6-9]\d{9}$/)
      .withMessage('Please enter a valid 10-digit mobile number')
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

      await AuthController.sendOTP(req, res);
    } catch (error) {
      console.error('Send OTP error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Direct login without OTP
// @access  Public
router.post('/login',
  loginRateLimit,
  [
    body('mobile_number')
      .isLength({ min: 10, max: 10 })
      .withMessage('Mobile number must be exactly 10 digits')
      .matches(/^[6-9]\d{9}$/)
      .withMessage('Please enter a valid 10-digit mobile number')
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

      await AuthController.directLogin(req, res);

    } catch (error) {
      console.error('Direct login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and login user
// @access  Public
router.post('/verify-otp',
  verifyRateLimit,
  [
    body('mobile_number')
      .isLength({ min: 10, max: 10 })
      .withMessage('Mobile number must be exactly 10 digits')
      .matches(/^[6-9]\d{9}$/)
      .withMessage('Please enter a valid 10-digit mobile number'),
    body('otp')
      .isLength({ min: 6, max: 6 })
      .withMessage('OTP must be exactly 6 digits')
      .matches(/^\d{6}$/)
      .withMessage('OTP must contain only numbers')
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

      await AuthController.verifyOTP(req, res);

    } catch (error) {
      console.error('Verify OTP error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, AuthController.getProfile);

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', auth, AuthController.logout);

module.exports = router;
