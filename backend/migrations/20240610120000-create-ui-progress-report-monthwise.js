"use strict";

require('dotenv').config();

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("ui_progress_report_month", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      ui_case_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      eq_case_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      month_of_the_file:{
        type: Sequelize.STRING,
        allowNull: false,
      },
      monthwise_file_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      monthwise_file_path: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      submission_date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("ui_progress_report_month");
  }
};
