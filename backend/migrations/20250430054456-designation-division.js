"use strict";

require("dotenv").config(); // Load .env variables

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = process.env.DB_SCHEMA || "public"; // Default schema

    await queryInterface.sequelize.query(`CREATE SCHEMA IF NOT EXISTS ${schema};`);

    await queryInterface.createTable(
      { schema: schema, tableName: "designation_division" },
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        designation_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: { schema: schema, tableName: "designation" },
            key: "designation_id",
          },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },
        division_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: { schema: schema, tableName: "division" },
            key: "division_id",
          },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },
        created_by: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
      }
    );
  },

  async down(queryInterface, Sequelize) {
    const schema = process.env.DB_SCHEMA || "public";
    await queryInterface.dropTable({ schema: schema, tableName: "users_designation" });
  },
};
