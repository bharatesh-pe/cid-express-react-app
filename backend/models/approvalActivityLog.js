'use strict';
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class ApprovalFieldLog extends Model {}

  ApprovalFieldLog.init(
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
      modelName: "ApprovalFieldLog",
      tableName: "approval_field_logs",
      timestamps: false,
    }
  );

  return ApprovalFieldLog;
};
