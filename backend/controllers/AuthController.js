const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/OTP');
const otpService = require('../services/otpService');

class AuthController {
  // Direct login without OTP (new method)
  async directLogin(req, res) {
    try {
      const { mobile_number } = req.body;

      // Check if user exists
      const user = await User.findByMobile(mobile_number);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found with this mobile number'
        });
      }

      // Update last login
      await user.updateLastLogin();

      // Generate JWT token
      const userProfile = await user.getProfile();
      const token = jwt.sign(
        { 
          userId: user.id,
          mobile_number: user.mobile_number,
          user_name: user.user_name,
          applications: userProfile.applications
        },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: userProfile
      });

    } catch (error) {
      console.error('Direct login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Send OTP to mobile number (kept for backward compatibility)
  async sendOTP(req, res) {
    try {
      const { mobile_number } = req.body;

      // Check if user exists
      const user = await User.findByMobile(mobile_number);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found with this mobile number'
        });
      }

      // Generate and send OTP via SMS
      const result = await otpService.sendOTP(mobile_number, user.id);
      
      // Save OTP to database
      await OTP.create({
        userId: user.id,
        otp: result.otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes (same as cop-mob)
      });

      res.json({
        success: true,
        message: 'OTP sent successfully',
        mobile_number: mobile_number.replace(/(\d{2})(\d{4})(\d{4})/, '$1****$3') // Mask mobile number
      });

    } catch (error) {
      console.error('Send OTP error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Verify OTP and login user
  async verifyOTP(req, res) {
    try {
      const { mobile_number, otp } = req.body;

      // Find user
      const user = await User.findByMobile(mobile_number);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Find valid OTP
      const otpRecord = await OTP.findValidOTP(user.id, otp);
      
      if (!otpRecord) {
        // Increment attempts for any existing OTP record
        const existingOTP = await OTP.findOne({ 
          where: { 
            userId: user.id, 
            otp 
          } 
        });
        if (existingOTP) {
          await existingOTP.incrementAttempts();
        }
        
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired OTP'
        });
      }

      // Mark OTP as used
      await otpRecord.markAsUsed();

      // Update last login
      await user.updateLastLogin();

      // Generate JWT token
      const userProfile = await user.getProfile();
      const token = jwt.sign(
        { 
          userId: user.id,
          mobile_number: user.mobile_number,
          user_name: user.user_name,
          applications: userProfile.applications
        },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: userProfile
      });

    } catch (error) {
      console.error('Verify OTP error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get user profile
  async getProfile(req, res) {
    try {
      const userProfile = await req.user.getProfile();
      res.json({
        success: true,
        user: userProfile
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Logout user
  async logout(req, res) {
    try {
      // In a more sophisticated setup, you might want to blacklist the token
      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = new AuthController();
