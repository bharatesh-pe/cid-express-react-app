"use strict";

require("dotenv").config(); // Load environment variables

module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = process.env.DB_SCHEMA || "public"; // Get schema from .env

    await queryInterface.createTable(
      { tableName: "cases_action", schema }, // Include schema
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        name: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        table: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        module: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        is_pdf: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
        },
        is_approval: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
          allowNull: true,
        },
        field: {
            type: Sequelize.TEXT,
            allowNull: true
        },
      }
    );
  },

  async down(queryInterface, Sequelize) {
    const schema = process.env.DB_SCHEMA || "public"; // Use schema from .env
    await queryInterface.dropTable({
      tableName: "cases_action",
      schema,
    });
  },
};
