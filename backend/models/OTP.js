const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('../config/database');

const OTP = sequelize.define('OTP', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  otp: {
    type: DataTypes.STRING(6),
    allowNull: false,
    validate: {
      len: [6, 6],
      isNumeric: true
    }
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: function() {
      // OTP expires in 10 minutes (same as cop-mob project)
      return new Date(Date.now() + 10 * 60 * 1000);
    }
  },
  attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      max: 3
    }
  },
  isUsed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'otps',
  timestamps: true,
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['expiresAt']
    },
    {
      fields: ['otp']
    }
  ]
});

// Instance methods
OTP.prototype.isValid = function() {
  return !this.isUsed && this.attempts < 3 && new Date() < this.expiresAt;
};

OTP.prototype.markAsUsed = async function() {
  this.isUsed = true;
  return this.save();
};

OTP.prototype.incrementAttempts = async function() {
  this.attempts += 1;
  return this.save();
};

// Static methods
OTP.findValidOTP = async function(userId, otp) {
  return this.findOne({
    where: {
      userId,
      otp,
      isUsed: false,
      attempts: {
        [Op.lt]: 3
      },
      expiresAt: {
        [Op.gt]: new Date()
      }
    }
  });
};

OTP.cleanupExpiredOTPs = async function() {
  return this.destroy({
    where: {
      [Op.or]: [
        {
          expiresAt: {
            [Op.lt]: new Date()
          }
        },
        {
          attempts: {
            [Op.gte]: 3
          }
        }
      ]
    }
  });
};

// Define associations
OTP.associate = function(models) {
  OTP.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
};

module.exports = OTP;
