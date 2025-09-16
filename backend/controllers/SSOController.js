const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const SSOToken = require('../models/SSOToken');

class SSOController {
  // Encryption utility methods
  encryptToken(data) {
    const algorithm = 'aes-256-gcm';
    const publicKey = process.env.PUBLIC_KEY || 'POLICEAPP';
    const key = crypto.scryptSync(publicKey, 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, key);
    cipher.setAAD(Buffer.from('sso-token', 'utf8'));
    
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted: encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  decryptToken(encryptedData) {
    try {
      const algorithm = 'aes-256-gcm';
      const publicKey = process.env.PUBLIC_KEY || 'POLICEAPP';
      const key = crypto.scryptSync(publicKey, 'salt', 32);
      const decipher = crypto.createDecipher(algorithm, key);
      decipher.setAAD(Buffer.from('sso-token', 'utf8'));
      decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
      
      let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return JSON.parse(decrypted);
    } catch (error) {
      throw new Error('Failed to decrypt token');
    }
  }

  generateSecureTokenId() {
    return crypto.randomBytes(16).toString('hex');
  }
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

      // Generate unique token ID
      const tokenId = this.generateSecureTokenId();

      // Create token data
      const tokenData = {
        userId: user.id,
        user_name: user.user_name,
        mobile_number: user.mobile_number,
        applicationCode: applicationCode,
        timestamp: Date.now(),
        tokenId: tokenId
      };

      // Encrypt the token data
      const encryptedData = this.encryptToken(tokenData);

      // Set expiration time (30 minutes from now)
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

      // Store encrypted token in database
      const ssoTokenRecord = await SSOToken.create({
        tokenId: tokenId,
        userId: user.id,
        applicationCode: applicationCode,
        encryptedToken: JSON.stringify(encryptedData),
        expiresAt: expiresAt
      });

      res.json({
        success: true,
        tokenId: tokenId,
        expiresAt: expiresAt,
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

  // Generate encrypted token for mobile number and source
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

      // Generate unique token ID
      const tokenId = this.generateSecureTokenId();

      // Create data to encrypt
      const dataToEncrypt = {
        mobile_number: user.mobile_number,
        source: 'police_app',
        applicationCode: applicationCode,
        userId: user.id,
        user_name: user.user_name,
        timestamp: Date.now(),
        tokenId: tokenId
      };

      // Encrypt the data
      const encryptedData = this.encryptToken(dataToEncrypt);

      // Set expiration time (30 minutes from now)
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

      // Store encrypted token in database
      const ssoTokenRecord = await SSOToken.create({
        tokenId: tokenId,
        userId: user.id,
        applicationCode: applicationCode,
        encryptedToken: JSON.stringify(encryptedData),
        expiresAt: expiresAt
      });

      res.json({
        success: true,
        tokenId: tokenId,
        expiresAt: expiresAt,
        applicationCode: applicationCode,
        expiresIn: '10m' // 10 minutes expiry
      });

    } catch (error) {
      console.error('Generate encrypted token error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Validate encrypted token using tokenId (for external applications to call)
  async validateEncryptedToken(req, res) {
    try {
      const { tokenId } = req.body;

      if (!tokenId) {
        return res.status(400).json({
          success: false,
          message: 'Token ID is required'
        });
      }

      // Find the token in database
      const tokenRecord = await SSOToken.findValidToken(tokenId);

      if (!tokenRecord) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }

      // Decrypt the token data
      const encryptedData = JSON.parse(tokenRecord.encryptedToken);
      const decryptedData = this.decryptToken(encryptedData);

      // Mark token as used
      await tokenRecord.markAsUsed();

      res.json({
        success: true,
        valid: true,
        data: {
          mobile_number: decryptedData.mobile_number,
          source: decryptedData.source,
          applicationCode: decryptedData.applicationCode,
          userId: decryptedData.userId,
          user_name: decryptedData.user_name,
          timestamp: decryptedData.timestamp,
          expiresAt: tokenRecord.expiresAt
        }
      });

    } catch (error) {
      console.error('Validate encrypted token error:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid encrypted token'
      });
    }
  }

  // Validate SSO token using tokenId (for external applications to call)
  async validateSSOToken(req, res) {
    try {
      const { tokenId } = req.body;

      if (!tokenId) {
        return res.status(400).json({
          success: false,
          message: 'Token ID is required'
        });
      }

      // Find the token in database
      const tokenRecord = await SSOToken.findValidToken(tokenId);

      if (!tokenRecord) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }

      // Decrypt the token data
      const encryptedData = JSON.parse(tokenRecord.encryptedToken);
      const decryptedData = this.decryptToken(encryptedData);

      // Get user details
      const user = await User.findByPk(decryptedData.userId);
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Invalid user'
        });
      }

      // Mark token as used
      await tokenRecord.markAsUsed();

      res.json({
        success: true,
        valid: true,
        user: {
          id: user.id,
          user_name: user.user_name,
          mobile_number: user.mobile_number,
          applicationCode: decryptedData.applicationCode
        },
        expiresAt: tokenRecord.expiresAt
      });

    } catch (error) {
      console.error('Validate SSO token error:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid SSO token'
      });
    }
  }

  // Get token by ID for secure transmission (not via GET parameters)
  async getTokenById(req, res) {
    try {
      const { tokenId } = req.body;

      if (!tokenId) {
        return res.status(400).json({
          success: false,
          message: 'Token ID is required'
        });
      }

      // Find the token in database
      const tokenRecord = await SSOToken.findValidToken(tokenId);

      if (!tokenRecord) {
        return res.status(404).json({
          success: false,
          message: 'Token not found or expired'
        });
      }

      // Return token metadata without decrypting
      res.json({
        success: true,
        token: {
          tokenId: tokenRecord.tokenId,
          applicationCode: tokenRecord.applicationCode,
          expiresAt: tokenRecord.expiresAt,
          createdAt: tokenRecord.createdAt,
          isUsed: tokenRecord.isUsed
        }
      });

    } catch (error) {
      console.error('Get token by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Cleanup expired tokens (can be called periodically)
  async cleanupExpiredTokens(req, res) {
    try {
      const cleanedCount = await SSOToken.cleanupExpiredTokens();
      
      res.json({
        success: true,
        message: `Cleaned up ${cleanedCount} expired tokens`,
        cleanedCount: cleanedCount
      });

    } catch (error) {
      console.error('Cleanup expired tokens error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get active tokens for a user
  async getUserTokens(req, res) {
    try {
      const user = req.user; // From auth middleware
      const { applicationCode } = req.query;

      const tokens = await SSOToken.getActiveTokensForUser(user.id, applicationCode);

      res.json({
        success: true,
        tokens: tokens.map(token => ({
          tokenId: token.tokenId,
          applicationCode: token.applicationCode,
          expiresAt: token.expiresAt,
          createdAt: token.createdAt,
          isUsed: token.isUsed
        }))
      });

    } catch (error) {
      console.error('Get user tokens error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Revoke a specific token
  async revokeToken(req, res) {
    try {
      const { tokenId } = req.body;
      const user = req.user; // From auth middleware

      if (!tokenId) {
        return res.status(400).json({
          success: false,
          message: 'Token ID is required'
        });
      }

      // Find the token
      const tokenRecord = await SSOToken.findOne({
        where: {
          tokenId: tokenId,
          userId: user.id,
          isActive: true
        }
      });

      if (!tokenRecord) {
        return res.status(404).json({
          success: false,
          message: 'Token not found'
        });
      }

      // Mark as inactive
      tokenRecord.isActive = false;
      await tokenRecord.save();

      res.json({
        success: true,
        message: 'Token revoked successfully'
      });

    } catch (error) {
      console.error('Revoke token error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Validate tokenId for external applications (Vue.js app)
  async validateTokenId(req, res) {
    try {
      const { tokenId } = req.body;

      console.log('🔍 Validating tokenId:', tokenId);

      if (!tokenId) {
        return res.status(400).json({
          success: false,
          message: 'Token ID is required'
        });
      }

      // Find the token in database
      console.log('📋 Looking for token in database...');
      const tokenRecord = await SSOToken.findValidToken(tokenId);
      
      if (!tokenRecord) {
        console.log('❌ Token not found or invalid');
        
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }

      console.log('✅ Token found and valid');

      // Decrypt the token data
      const encryptedData = JSON.parse(tokenRecord.encryptedToken);
      const decryptedData = this.decryptToken(encryptedData);

      // Note: Not marking token as used to allow
    //   await tokenRecord.markAsUsed();

      // Return the decrypted data for Vue.js app
      res.json({
        success: true,
        mobile_number: decryptedData.mobile_number,
        source: decryptedData.source,
        applicationCode: decryptedData.applicationCode,
        userId: decryptedData.userId,
        user_name: decryptedData.user_name,
        timestamp: decryptedData.timestamp
      });

    } catch (error) {
      console.error('Validate tokenId error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = new SSOController();
