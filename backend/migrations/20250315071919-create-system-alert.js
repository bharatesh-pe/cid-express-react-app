"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("system_alerts", {
      system_alert_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      approval_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "ui_case_approvals", // Table name of the UiCaseApproval model
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      reference_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      alert_message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      alert_type: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      alert_status: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: "Pending",
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "user_id",
        },
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("system_alerts");
  },
};
