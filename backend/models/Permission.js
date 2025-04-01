"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Permission extends Model {
    static associate(models) {
      // Define associations here if needed
    }
  }

  Permission.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      permission_key: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      permission_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      module_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Module',
          key: 'module_id'
        }
      },
      order_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Permission",
      tableName: "permissions",
      schema: process.env.DB_SCHEMA || "public",
      timestamps: false,
    }
  );

  Permission.associate = (models) => {
    // Define the association with Role table
    Permission.belongsTo(models.Module, {
      foreignKey: 'module_id',
      as: 'module'
    });
  }

  return Permission;
};
