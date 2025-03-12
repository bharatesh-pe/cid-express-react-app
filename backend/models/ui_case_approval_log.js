"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class UiCaseApprovalLog extends Model {
    static associate(models) {
      UiCaseApprovalLog.belongsTo(models.ApprovalItem, { foreignKey: "approval_item_id" });
      //UiCaseApprovalLog.belongsTo(models.UiCase, { foreignKey: "ui_case_id" });
      UiCaseApprovalLog.belongsTo(models.Users, { foreignKey: "approved_by", as: "approver" });
      UiCaseApprovalLog.belongsTo(models.Users, { foreignKey: "created_by", as: "creator" });
    }
  }

  UiCaseApprovalLog.init(
    {
      approval_log_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      approval_item_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      ui_case_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      approved_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      date_of_approval: {
        type: DataTypes.DATE,
      },
      comments: {
        type: DataTypes.TEXT,
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
      modelName: "UiCaseApprovalLog",
      tableName: "ui_case_approval_log",
      timestamps: false, // If using created_at & updated_at manually
    }
  );

  return UiCaseApprovalLog;
};

