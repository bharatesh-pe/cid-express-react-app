const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

class SSOController {
  // Generate SSO token for external application
  async generateSSOToken(req, res) {
    try {
      const { applicationCode } = req.params;
      const user = req.user; // From auth middleware

      // Check if user has access to this application
      const userProfile = await user.getProfile();
      if (!userProfile.applications.includes(applicationCode)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this application'
        });
      }

      // Generate SSO token with short expiry (5 minutes)
      const ssoToken = jwt.sign(
        {
          userId: user.id,
          user_name: user.user_name,
          mobile_number: user.mobile_number,
          applicationCode: applicationCode,
          timestamp: Date.now()
        },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '5m' } // 5 minutes expiry
      );

      // Generate a unique token ID for tracking
      const tokenId = crypto.randomBytes(16).toString('hex');

      res.json({
        success: true,
        ssoToken: ssoToken,
        tokenId: tokenId,
        expiresIn: '5m',
        applicationCode: applicationCode,
        user: {
          id: user.id,
          user_name: user.user_name,
          mobile_number: user.mobile_number
        }
      });

    } catch (error) {
      console.error('Generate SSO token error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Validate SSO token (for external applications to call)
  async validateSSOToken(req, res) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'SSO token is required'
        });
      }

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

      // Check if token is not expired
      if (Date.now() > decoded.exp * 1000) {
        return res.status(401).json({
          success: false,
          message: 'SSO token has expired'
        });
      }

      // Get user details
      const user = await User.findByPk(decoded.userId);
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Invalid user'
        });
      }

      res.json({
        success: true,
        valid: true,
        user: {
          id: user.id,
          user_name: user.user_name,
          mobile_number: user.mobile_number,
          applicationCode: decoded.applicationCode
        },
        expiresAt: new Date(decoded.exp * 1000)
      });

    } catch (error) {
      console.error('Validate SSO token error:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid SSO token'
      });
    }
  }
}

module.exports = new SSOController();
