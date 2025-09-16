const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserApplication = sequelize.define('UserApplication', {
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
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  applicationCode: {
    type: DataTypes.STRING(100),
    allowNull: false,
    references: {
      model: 'applications',
      key: 'code'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  assignedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'user_applications',
  timestamps: true,
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['applicationCode']
    },
    {
      fields: ['userId', 'applicationCode'],
      unique: true
    },
    {
      fields: ['isActive']
    }
  ]
});

// Instance methods
UserApplication.prototype.getPublicInfo = function() {
  return {
    id: this.id,
    userId: this.userId,
    applicationCode: this.applicationCode,
    isActive: this.isActive,
    assignedAt: this.assignedAt
  };
};

// Static methods
UserApplication.getUserApplications = async function(userId) {
  return this.findAll({
    where: { 
      userId,
      isActive: true 
    },
    order: [['assignedAt', 'ASC']]
  });
};

UserApplication.getApplicationUsers = async function(applicationCode) {
  return this.findAll({
    where: { 
      applicationCode,
      isActive: true 
    },
    order: [['assignedAt', 'ASC']]
  });
};

UserApplication.assignApplication = async function(userId, applicationCode) {
  // Check if assignment already exists
  const existing = await this.findOne({
    where: { userId, applicationCode }
  });

  if (existing) {
    if (!existing.isActive) {
      // Reactivate existing assignment
      await existing.update({ isActive: true });
    }
    return existing;
  }

  // Create new assignment
  return this.create({
    userId,
    applicationCode,
    isActive: true
  });
};

UserApplication.removeApplication = async function(userId, applicationCode) {
  const assignment = await this.findOne({
    where: { userId, applicationCode }
  });

  if (assignment) {
    await assignment.update({ isActive: false });
  }

  return assignment;
};

// Define associations
UserApplication.associate = function(models) {
  UserApplication.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
  
  UserApplication.belongsTo(models.Application, {
    foreignKey: 'applicationCode',
    targetKey: 'code',
    as: 'application'
  });
};

module.exports = UserApplication;
