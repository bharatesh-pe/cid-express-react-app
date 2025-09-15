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

  // Generate simple encoded token for mobile number and source
  async generateEncryptedToken(req, res) {
    try {
      const user = req.user; // From auth middleware
      const { applicationCode } = req.body;

      // Check if user has access to this application
      const userProfile = await user.getProfile();
      if (!userProfile.applications.includes(applicationCode)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this application'
        });
      }

      // Create data to encode
      const dataToEncode = {
        mobile_number: user.mobile_number,
        source: 'police_app',
        applicationCode: applicationCode,
        timestamp: Date.now(),
        expiry: Date.now() + (10 * 60 * 1000) // 10 minutes from now
      };

      // Convert to JSON string
      const jsonString = JSON.stringify(dataToEncode);

      // Simple base64 encoding (universally supported)
      const encodedToken = Buffer.from(jsonString, 'utf8').toString('base64');

      res.json({
        success: true,
        token: encodedToken,
        applicationCode: applicationCode,
        expiresIn: '10m' // 10 minutes expiry
      });

    } catch (error) {
      console.error('Generate encoded token error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Validate encoded token (for external applications to call)
  async validateEncryptedToken(req, res) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Encoded token is required'
        });
      }

      // Simple base64 decoding (universally supported)
      const decodedString = Buffer.from(token, 'base64').toString('utf8');

      // Parse the decoded JSON
      const data = JSON.parse(decodedString);

      // Check if token has expired
      if (Date.now() > data.expiry) {
        return res.status(401).json({
          success: false,
          message: 'Token has expired'
        });
      }

      res.json({
        success: true,
        valid: true,
        data: {
          mobile_number: data.mobile_number,
          source: data.source,
          applicationCode: data.applicationCode,
          timestamp: data.timestamp,
          expiry: data.expiry
        }
      });

    } catch (error) {
      console.error('Validate encoded token error:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid encoded token'
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
