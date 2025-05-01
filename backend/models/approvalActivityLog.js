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
      case_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      field_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      old_value: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      updated_value: {
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
