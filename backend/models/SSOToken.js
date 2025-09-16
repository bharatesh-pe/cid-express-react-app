const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('../config/database');

const SSOToken = sequelize.define('SSOToken', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tokenId: {
    type: DataTypes.STRING(32),
    allowNull: false,
    unique: true,
    validate: {
      len: [32, 32],
      notEmpty: true
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  applicationCode: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  encryptedToken: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  isUsed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  usedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'sso_tokens',
  timestamps: true,
  indexes: [
    {
      fields: ['tokenId']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['applicationCode']
    },
    {
      fields: ['expiresAt']
    },
    {
      fields: ['isActive']
    },
    {
      fields: ['isUsed']
    }
  ]
});

// Instance methods
SSOToken.prototype.markAsUsed = async function() {
  this.isUsed = true;
  this.usedAt = new Date();
  return this.save();
};

SSOToken.prototype.isExpired = function() {
  return new Date() > this.expiresAt;
};

SSOToken.prototype.isValid = function() {
  return this.isActive && !this.isExpired();
};

// Static methods
SSOToken.findByTokenId = async function(tokenId) {
  return this.findOne({
    where: {
      tokenId,
      isActive: true
    }
  });
};

SSOToken.findValidToken = async function(tokenId) {
  const token = await this.findByTokenId(tokenId);
  if (!token || !token.isValid()) {
    return null;
  }
  return token;
};

SSOToken.cleanupExpiredTokens = async function() {
  const result = await this.update(
    { isActive: false },
    {
      where: {
        expiresAt: {
          [Op.lt]: new Date()
        },
        isActive: true
      }
    }
  );
  return result[0]; // Number of affected rows
};

SSOToken.getActiveTokensForUser = async function(userId, applicationCode = null) {
  const whereClause = {
    userId,
    isActive: true,
    isUsed: false,
    expiresAt: {
      [Op.gt]: new Date()
    }
  };

  if (applicationCode) {
    whereClause.applicationCode = applicationCode;
  }

  return this.findAll({
    where: whereClause,
    order: [['createdAt', 'DESC']]
  });
};

// Define associations
SSOToken.associate = function(models) {
  SSOToken.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
};

module.exports = SSOToken;
