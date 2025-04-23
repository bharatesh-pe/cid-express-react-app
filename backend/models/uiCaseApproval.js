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
      UiCaseApproval.belongsTo(models.Users, {
        foreignKey: "created_by",
        as: "user",
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
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      reference_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      approval_type: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      module: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      action: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      info: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "user_id",
        },
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      sequelize,
      modelName: "UiCaseApproval",
      tableName: "ui_case_approval",
      underscored: true,
      timestamps: false,
    }
  );

  return UiCaseApproval;
};
