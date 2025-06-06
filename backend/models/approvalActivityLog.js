'use strict';
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class ApprovalActivityLog extends Model {}

  ApprovalActivityLog.init(
    {
      log_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      approval_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
      approval_item_id:{
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      case_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      approved_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      approved_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      approval_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      module: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "ApprovalActivityLog",
      tableName: "approval_activity_logs",
      timestamps: false,
    }
  );

  return ApprovalActivityLog;
};
