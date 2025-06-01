"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class UiProgressReportFileStatus extends Model {
    static associate(models) {
      // Define associations here if needed
    }
  }

  UiProgressReportFileStatus.init(
    {
      ui_case_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      eq_case_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      is_pdf: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      file_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      file_path: {
        type: DataTypes.STRING,
        allowNull: false,
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
      modelName: "UiProgressReportFileStatus",
      tableName: "ui_progress_report_file_status",
      timestamps: false,
    }
  );

  return UiProgressReportFileStatus;
};