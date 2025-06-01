"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class UiProgressReportMonthWise extends Model {
    static associate(models) {
      // Define associations here if needed
    }
  }

  UiProgressReportMonthWise.init(
    {
      ui_case_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      eq_case_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      month_of_the_file:{
        type: DataTypes.STRING,
        allowNull: false,
      },
      monthwise_file_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      monthwise_file_path: {
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
      submission_date : {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      }
    },
    {
      sequelize,
      modelName: "UiProgressReportMonthWise",
      tableName: "ui_progress_report_month",
      timestamps: false,
    }
  );

  return UiProgressReportMonthWise;
};