"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ApprovalItem extends Model {
    static associate(models) {
      ApprovalItem.hasMany(models.UiCaseApprovalLog, { foreignKey: "approval_item_id" });
    }
  }

  ApprovalItem.init(
    {
      approval_item_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "ApprovalItem",
      tableName: "approval_item",
      timestamps: false, // If using created_at & updated_at manually
    }
  );

  return ApprovalItem;
};

