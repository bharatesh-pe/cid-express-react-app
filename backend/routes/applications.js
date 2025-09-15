const express = require('express');
const { body, validationResult } = require('express-validator');
const ApplicationController = require('../controllers/ApplicationController');
const { auth, isAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/applications
// @desc    Get all active applications
// @access  Public
router.get('/', ApplicationController.getApplications);

// @route   GET /api/applications/:id
// @desc    Get application by ID
// @access  Public
router.get('/:id', ApplicationController.getApplication);

// @route   POST /api/applications
// @desc    Create new application
// @access  Private (Admin only)
router.post('/',
  auth,
  isAdmin,
  [
    body('code')
      .notEmpty()
      .withMessage('Code is required')
      .isLength({ max: 100 })
      .withMessage('Code cannot exceed 100 characters'),
    body('link')
      .isURL()
      .withMessage('Please provide a valid URL'),
    body('image')
      .notEmpty()
      .withMessage('Image is required'),
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    body('order')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Order must be a non-negative integer')
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

      await ApplicationController.createApplication(req, res);
    } catch (error) {
      console.error('Create application error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

// @route   PUT /api/applications/:id
// @desc    Update application
// @access  Private (Admin only)
router.put('/:id',
  auth,
  isAdmin,
  [
    body('code')
      .optional()
      .isLength({ max: 100 })
      .withMessage('Code cannot exceed 100 characters'),
    body('link')
      .optional()
      .isURL()
      .withMessage('Please provide a valid URL'),
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    body('order')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Order must be a non-negative integer'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean value')
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

      await ApplicationController.updateApplication(req, res);
    } catch (error) {
      console.error('Update application error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

// @route   DELETE /api/applications/:id
// @desc    Delete application (soft delete)
// @access  Private (Admin only)
router.delete('/:id',
  auth,
  isAdmin,
  ApplicationController.deleteApplication
);

module.exports = router;
