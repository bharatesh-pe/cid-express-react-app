const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50],
      notEmpty: true
    }
  },
  mobile_number: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true,
    validate: {
      is: /^[6-9]\d{9}$/,
      notEmpty: true
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  indexes: [
    {
      fields: ['mobile_number']
    },
    {
      fields: ['user_name']
    },
    {
      fields: ['isActive']
    }
  ]
});

// Instance methods
User.prototype.updateLastLogin = async function() {
  this.lastLogin = new Date();
  return this.save();
};

User.prototype.getProfile = async function() {
  // Get applications using direct SQL query to avoid circular dependencies
  const { sequelize } = require('../config/database');
  const userApplications = await sequelize.query(
    'SELECT applicationCode FROM user_applications WHERE userId = :userId AND isActive = true',
    {
      replacements: { userId: this.id },
      type: sequelize.QueryTypes.SELECT
    }
  );
  const applications = userApplications.map(ua => ua.applicationCode);

  return {
    id: this.id,
    user_name: this.user_name,
    mobile_number: this.mobile_number,
    applications: applications,
    isActive: this.isActive,
    isAdmin: this.isAdmin,
    lastLogin: this.lastLogin
  };
};

// Static methods
User.findByMobile = async function(mobile_number) {
  return this.findOne({ 
    where: { 
      mobile_number, 
      isActive: true 
    } 
  });
};

User.findByApplication = async function(applicationCode) {
  const UserApplication = require('./UserApplication');
  
  // Get user IDs who have this application
  const userApplications = await UserApplication.findAll({
    where: { 
      applicationCode,
      isActive: true 
    }
  });

  const userIds = userApplications.map(ua => ua.userId);

  if (userIds.length === 0) {
    return [];
  }

  return this.findAll({ 
    where: { 
      id: userIds,
      isActive: true 
    } 
  });
};

// Define associations
User.associate = function(models) {
  User.hasMany(models.UserApplication, {
    foreignKey: 'userId',
    as: 'userApplications'
  });
  
  User.belongsToMany(models.Application, {
    through: models.UserApplication,
    foreignKey: 'userId',
    otherKey: 'applicationCode',
    as: 'applications'
  });
  
  User.hasMany(models.OTP, {
    foreignKey: 'userId',
    as: 'otps'
  });
};

module.exports = User;
