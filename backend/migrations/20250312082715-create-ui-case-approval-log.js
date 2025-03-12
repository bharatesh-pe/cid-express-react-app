"use strict";

require("dotenv").config(); // Load .env variables

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = process.env.DB_SCHEMA || "cid"; // Default to 'cid' if DB_SCHEMA is not set

    await queryInterface.sequelize.query(`CREATE SCHEMA IF NOT EXISTS ${schema};`);

    await queryInterface.createTable(
      { schema: schema, tableName: "ui_case_approval_log" },
      {
        approval_log_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        approval_item_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: { schema: schema, tableName: "approval_item" },
            key: "approval_item_id",
          },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },
        ui_case_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        approved_by: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: { schema: schema, tableName: "users" },
            key: "user_id",
          },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },
        date_of_approval: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        comments: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        created_by: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: { schema: schema, tableName: "users" },
            key: "user_id",
          },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
      }
    );
  },

  async down(queryInterface, Sequelize) {
    const schema = process.env.DB_SCHEMA || "cid";
    await queryInterface.dropTable({ schema: schema, tableName: "ui_case_approval_log" });
  },
};
