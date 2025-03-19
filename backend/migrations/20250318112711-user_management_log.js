"use strict";

require("dotenv").config(); // Load environment variables

module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = process.env.DB_SCHEMA || "public"; // Get schema from .env

    await queryInterface.createTable(
      { tableName: "user_management_log", schema }, // Include schema
      {
        log_id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: { tableName: "users", schema }, // Reference users table in schema
            key: "user_id",
          },
        },
        field: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        info: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
          allowNull: true,
        },
        by: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
      }
    );
  },

  async down(queryInterface, Sequelize) {
    const schema = process.env.DB_SCHEMA || "public"; // Use schema from .env
    await queryInterface.dropTable({
      tableName: "user_management_log",
      schema,
    });
  },
};
