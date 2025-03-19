"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const UserManagementLog = sequelize.define(
    "UserManagementLog",
    {
      log_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "user_id",
        },
      },
      action: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
      },
      details: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "user_management_log",
      timestamps: false,
      underscored: true,
      schema: "public",
    }
  );

  UserManagementLog.associate = (models) => {
    UserManagementLog.belongsTo(models.Users, {
      foreignKey: "user_id",
      as: "user",
    });
  };

  return UserManagementLog;
};
