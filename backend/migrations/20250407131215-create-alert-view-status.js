"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("alert_view_status", {
      alert_view_status_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      system_alert_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "system_alerts",
          key: "system_alert_id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT", // Don't allow delete if alert exists
      },
      view_status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      viewed_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "user_id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      viewed_by_designation_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "designation",
          key: "designation_id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      viewed_by_division_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "division",
          key: "division_id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      viewed_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("alert_view_status");
  },
};
