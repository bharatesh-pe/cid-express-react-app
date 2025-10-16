const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('../config/database');

const Application = sequelize.define('Application', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      len: [1, 100],
      notEmpty: true
    }
  },
  link: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  image: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      len: [0, 500]
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_analytics: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: null,
    comment: 'Indicates if the application should be shown in analytics section'
  }
}, {
  tableName: 'applications',
  timestamps: true,
  indexes: [
    {
      fields: ['code']
    },
    {
      fields: ['isActive']
    },
    {
      fields: ['order']
    },
    {
      fields: ['is_analytics']
    }
  ]
});

// Instance methods
Application.prototype.getPublicInfo = function() {
  return {
    id: this.id,
    code: this.code,
    link: this.link,
    image: this.image,
    description: this.description,
    order: this.order
  };
};

// Static methods
Application.getActiveApplications = async function() {
  return this.findAll({ 
    where: { isActive: true },
    order: [['order', 'ASC']]
  });
};

Application.getAnalyticsApplications = async function() {
  return this.findAll({ 
    where: { 
      isActive: true,
      is_analytics: true 
    },
    order: [['order', 'ASC']]
  });
};

Application.findByCode = async function(code) {
  return this.findOne({ 
    where: { 
      code: {
        [Op.iLike]: `%${code}%`
      },
      isActive: true 
    } 
  });
};

// Define associations
Application.associate = function(models) {
  Application.hasMany(models.UserApplication, {
    foreignKey: 'applicationCode',
    as: 'userApplications'
  });
  
  Application.belongsToMany(models.User, {
    through: models.UserApplication,
    foreignKey: 'applicationCode',
    otherKey: 'userId',
    as: 'users'
  });
};

module.exports = Application;
