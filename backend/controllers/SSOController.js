const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const SSOToken = require('../models/SSOToken');
const UserApplication = require('../models/UserApplication');
const Application = require('../models/Application');
const { Op } = require('sequelize');

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

  // Decrypt data using AES-256-CBC (for Laravel service compatibility)
  decryptLaravelData(encryptedData) {
    try {
      const key = process.env.POLICEAPP_ENCRYPTION_KEY || 'POLICEAPP';
      console.log('🔑 Decryption details:', {
        key: key,
        keyLength: key.length,
        encryptedDataLength: encryptedData.length,
        encryptedDataType: typeof encryptedData
      });
      
      // Laravel uses urlencode(), so we need to decode it first
      let decodedData = encryptedData;
      try {
        decodedData = decodeURIComponent(encryptedData);
        console.log('🔓 URL decoded data length:', decodedData.length);
      } catch (urlError) {
        console.log('⚠️ URL decode failed, using raw data:', urlError.message);
        decodedData = encryptedData;
      }
      
      // Match Laravel's encryption method exactly:
      // Laravel: $iv = substr(hash('sha256', $key), 0, 16); // 16 chars = 8 bytes
      // Laravel: openssl_encrypt($jsonData, 'AES-256-CBC', $key, 0, $iv);
      // OpenSSL automatically pads the IV to 16 bytes for AES-256-CBC
      const ivHex = crypto.createHash('sha256').update(key).digest('hex').substring(0, 16);
      const iv = Buffer.from(ivHex + '0000000000000000', 'hex').subarray(0, 16); // Pad to 16 bytes
      const paddedKey = key.padEnd(32, '\0'); // Pad to 32 bytes for AES-256
      
      console.log('🔐 Encryption parameters:', {
        ivHex: ivHex,
        iv: iv.toString('hex'),
        ivLength: iv.length,
        paddedKeyLength: paddedKey.length,
        decodedDataLength: decodedData.length
      });
      
      const decipher = crypto.createDecipheriv('aes-256-cbc', paddedKey, iv);
      let decrypted = decipher.update(decodedData, 'base64', 'utf8');
      decrypted += decipher.final('utf8');
      
      console.log('✅ Decryption successful, parsing JSON...');
      console.log('🔍 Decrypted data length:', decrypted.length);
      console.log('🔍 Decrypted data preview:', decrypted.substring(0, 100));
      
      // Try to parse JSON directly first
      try {
        return JSON.parse(decrypted);
      } catch (parseError) {
        console.log('⚠️ Direct JSON parse failed, trying to extract JSON from decrypted data...');
        
        // Extract JSON from the decrypted data (remove garbage characters at the beginning)
        // Look for JSON pattern in the decrypted data
        const jsonPattern = /"[^"]*"[^"]*"[^"]*".*}/;
        const jsonMatch = decrypted.match(jsonPattern);
        
        if (jsonMatch) {
          let jsonString = jsonMatch[0];
          // If JSON doesn't start with {, add it
          if (!jsonString.startsWith('{')) {
            jsonString = '{' + jsonString;
          }
          
          // Fix missing mobile_number key (Laravel sometimes omits the first key)
          // Look for a 10-digit number at the beginning of the JSON
          const mobileMatch = jsonString.match(/^\{?"(\d{10})"/);
          if (mobileMatch) {
            jsonString = jsonString.replace(`"${mobileMatch[1]}"`, `"mobile_number":"${mobileMatch[1]}"`);
          }
          
          console.log('🔍 Found JSON in decrypted data:', jsonString);
          return JSON.parse(jsonString);
        } else {
          // Try to find any JSON-like pattern
          const anyJsonMatch = decrypted.match(/"[^"]*".*}/);
          if (anyJsonMatch) {
            let jsonString = anyJsonMatch[0];
            if (!jsonString.startsWith('{')) {
              jsonString = '{' + jsonString;
            }
            console.log('🔍 Found JSON-like pattern:', jsonString);
            return JSON.parse(jsonString);
          } else {
            console.log('🔍 Full decrypted data for debugging:', decrypted);
            throw new Error('No valid JSON found in decrypted data');
          }
        }
      }
    } catch (error) {
      console.error('❌ Laravel decryption error:', error);
      console.error('❌ Error details:', {
        name: error.name,
        message: error.message,
        code: error.code
      });
      throw new Error('Failed to decrypt Laravel data');
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

  // Sync user from external application (Laravel service)
  async syncUser(req, res) {
    try {
      const { data, source } = req.body;



      if (!data) {
        return res.status(400).json({
          success: false,
          message: 'Encrypted data is required',
          status: 'error'
        });
      }

      // Decrypt the data from Laravel service
      let userData;
      try {
        userData = this.decryptLaravelData(data);
      } catch (decryptError) {
        
        return res.status(400).json({
          success: false,
          message: 'Failed to decrypt data',
          status: 'error',
          debug: {
            error: decryptError.message,
            dataLength: data.length,
            dataType: typeof data
          }
        });
      }

      const { 
        mobile_number, 
        user_name, 
        email, 
        isAdmin = false, 
        isActive = true, 
        applicationCode = 'MOB',
        action = 'create',
        createdAt 
      } = userData;

      // Validate required fields
      if (!mobile_number) {
        return res.status(400).json({
          success: false,
          message: 'Mobile number is required',
          status: 'error'
        });
      }

      // Validate mobile number format
      const mobileRegex = /^[6-9]\d{9}$/;
      if (!mobileRegex.test(mobile_number)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid mobile number format',
          status: 'error'
        });
      }

      let user;
      let isNewUser = false;

      // Find existing user by mobile number
      const existingUser = await User.findOne({
        where: { mobile_number: mobile_number }
      });

      if (existingUser) {
        // Update existing user
        user = existingUser;
        
        if (action === 'inactivate') {
          await user.update({ isActive: false });
          
          return res.json({
            success: true,
            message: 'User inactivated successfully',
            status: 'success',
            userId: user.id,
            action: 'inactivated'
          });
        }

        // Update user data
        const updateData = {};
        if (user_name && user_name !== user.user_name) {
          updateData.user_name = user_name;
        }
        if (isAdmin !== undefined) {
          updateData.isAdmin = isAdmin;
        }
        if (isActive !== undefined) {
          updateData.isActive = isActive;
        }

        if (Object.keys(updateData).length > 0) {
          await user.update(updateData);
        }

      } else {
        // Create new user
        if (!user_name) {
          return res.status(400).json({
            success: false,
            message: 'Username is required for new users',
            status: 'error'
          });
        }

        user = await User.create({
          user_name: user_name,
          mobile_number: mobile_number,
          isActive: isActive,
          isAdmin: isAdmin
        });
        
        isNewUser = true;
      }

      // Handle application assignment
      if (applicationCode) {
        // Check if application exists
        const application = await Application.findOne({
          where: { 
            code: applicationCode,
            isActive: true 
          }
        });

        if (application) {
          // Check if user already has this application
          const existingAssignment = await UserApplication.findOne({
            where: {
              userId: user.id,
              applicationCode: applicationCode
            }
          });

          if (!existingAssignment) {
            // Create new application assignment
            await UserApplication.create({
              userId: user.id,
              applicationCode: applicationCode,
              isActive: true
            });
          } else if (!existingAssignment.isActive) {
            // Reactivate existing assignment
            await existingAssignment.update({ isActive: true });
          }
        } else {
          console.log('⚠️ Application not found or inactive:', applicationCode);
        }
      }

      // Auto-assign Analytics applications for non-PS users
      if (user_name && !user_name.toLowerCase().includes('ps')) {
        
        // Get all Analytics applications
        const analyticsApplications = await Application.findAll({
          where: {
            is_analytics: true,
            isActive: true
          },
          attributes: ['code']
        });

        for (const app of analyticsApplications) {
          // Check if user already has this analytics application
          const existingAssignment = await UserApplication.findOne({
            where: {
              userId: user.id,
              applicationCode: app.code
            }
          });

          if (!existingAssignment) {
            // Create new analytics application assignment
            await UserApplication.create({
              userId: user.id,
              applicationCode: app.code,
              isActive: true
            });
          } else if (!existingAssignment.isActive) {
            // Reactivate existing analytics application assignment
            await existingAssignment.update({ isActive: true });
          }
        }
      } else if (user_name && user_name.toLowerCase().includes('ps')) {
        console.log('⏭️ Skipping Analytics applications for PS user:', user_name);
      }

      // Get user profile for response
      const userProfile = await user.getProfile();

      res.json({
        success: true,
        message: isNewUser ? 'User created successfully' : 'User synced successfully',
        status: 'success',
        userId: user.id,
        user: {
          id: user.id,
          user_name: user.user_name,
          mobile_number: user.mobile_number,
          isActive: user.isActive,
          isAdmin: user.isAdmin,
          applications: userProfile.applications
        },
        action: isNewUser ? 'created' : 'updated'
      });

    } catch (error) {
      console.error('❌ SSO Sync User error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        status: 'error',
        error: error.message
      });
    }
  }
}

module.exports = new SSOController();
