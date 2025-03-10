'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  const AuthSecure = sequelize.define('AuthSecure', {
    auth_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'user_id'
      }
    },
    kgid: {
      type: DataTypes.STRING,
      allowNull: true
    },
    pin: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    otp: {
      type: DataTypes.STRING,
      defaultValue: '0',
      allowNull: true
    },
    otp_expires_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    no_of_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: true
    },
    last_attempt_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    dev_status: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: true
    }
  }, {
    tableName: 'auth_secure',
    timestamps: false,
    underscored: true
  });

  AuthSecure.associate = (models) => {
    AuthSecure.belongsTo(models.Users, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return AuthSecure;
};