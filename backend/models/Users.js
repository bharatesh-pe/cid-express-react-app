'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define('Users', {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Role',
        key: 'role_id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    kgid: {
      type: DataTypes.STRING,
      allowNull: true
    },
    cug_no: {
      type: DataTypes.STRING,
      allowNull: true
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: true
    },
    dev_status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: true
    }
  }, {
    tableName: 'users',
    timestamps: false,
    underscored: true,
    schema: 'public'
  });

  Users.associate = (models) => {
    // Define the association with Role table
    Users.belongsTo(models.Role, {
      foreignKey: 'role_id',
      as: 'role'
    });

   // Add correct association with UserDesignation
    Users.hasMany(models.UserDesignation, {
      foreignKey: 'user_id',
      as: 'users_designations'
    });

    // Add correct association with UsersDepartment
    Users.hasMany(models.UsersDepartment, {
      foreignKey: 'user_id',
      as: 'users_departments'
    });

    // Add correct association with UsersDivision
    Users.hasMany(models.UsersDivision, {
      foreignKey: 'user_id',
      as: 'users_divisions'
    });
  };

  return Users;
};