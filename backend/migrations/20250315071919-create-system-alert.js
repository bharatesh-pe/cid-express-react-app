"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("system_alerts", {
      system_alert_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      approval_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "ui_case_approval",
          key: "approval_id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
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
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "user_id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      created_by_designation_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "designation",
          key: "designation_id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      created_by_division_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "division",
          key: "division_id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      send_to: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "user_id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("system_alerts");
  },
};
