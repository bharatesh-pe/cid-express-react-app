"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class UiCaseApproval extends Model {
    static associate(models) {
      // Define associations here
      UiCaseApproval.belongsTo(models.ApprovalItem, {
        foreignKey: "approval_item",
        as: "approvalItem",
      });
      UiCaseApproval.belongsTo(models.Designation, {
        foreignKey: "approved_by",
        as: "approvedBy",
      });
      UiCaseApproval.hasMany(models.System_Alerts, {
        foreignKey: "approval_id",
        as: "alerts",
      });
    }
  }

  UiCaseApproval.init(
    {
      approval_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      approval_item: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      approved_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      approval_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      remarks: {
        type: DataTypes.STRING(255), // Adjust length as needed
        allowNull: true,
      },
      ui_case_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      pt_case_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      eq_case_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "UiCaseApproval",
      tableName: "ui_case_approval",
      underscored: true, // Use snake_case for database columns
      timestamps: false, // Set to true if you want createdAt and updatedAt fields
    }
  );

  return UiCaseApproval;
};
