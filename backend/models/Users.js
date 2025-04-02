"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define(
    "Users",
    {
      user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Role",
          key: "role_id",
        },
      },
      kgid_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "kgid",
          key: "id",
        },
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: true,
      },
      dev_status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: true,
      },
    },
    {
      tableName: "users",
      timestamps: false,
      underscored: true,
      schema: "public",
    }
  );

  Users.associate = (models) => {
    Users.belongsTo(models.Role, {
      foreignKey: "role_id",
      as: "role",
    });

    Users.belongsTo(models.KGID, {
      foreignKey: "kgid_id",
      as: "kgidDetails",
    });

    Users.hasMany(models.UserDesignation, {
      foreignKey: "user_id",
      as: "users_designations",
    });

    Users.hasMany(models.UsersDepartment, {
      foreignKey: "user_id",
      as: "users_departments",
    });

    Users.hasMany(models.UsersDivision, {
      foreignKey: "user_id",
      as: "users_division",
    });
    
    Users.hasMany(models.UserManagementLog, {
      foreignKey: "user_id",
      as: "user_management_logs",
    });
  };


  return Users;
};
