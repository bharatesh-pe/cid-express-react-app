"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = process.env.DB_SCHEMA || "public"; // Default to 'public' if DB_SCHEMA is not set

    await queryInterface.sequelize.query(
      `CREATE SCHEMA IF NOT EXISTS ${schema};`
    );

    await queryInterface.createTable(
      { schema: schema, tableName: "ui_case_approval" },
      {
        approval_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        approval_item: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: { schema: schema, tableName: "approval_item" },
            key: "approval_item_id",
          },
        },
        approved_by: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: { schema: schema, tableName: "designation" },
            key: "designation_id",
          },
        },
        approval_date: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        remarks: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        reference_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        approval_type: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        module: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        action: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        info: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        created_by: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: { schema: schema, tableName: "users" },
            key: "user_id",
          },
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
    await queryInterface.dropTable({
      schema: schema,
      tableName: "ui_case_approval",
    });
  },
};
