"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = process.env.DB_SCHEMA || "public"; // Default to 'cid' if DB_SCHEMA is not set

    await queryInterface.sequelize.query(`CREATE SCHEMA IF NOT EXISTS ${schema};`);

    await queryInterface.createTable(
      { schema: schema, tableName: "approval_item" },
      {
        approval_item_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
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
    const schema = process.env.DB_SCHEMA || "public";

    await queryInterface.dropTable({ schema: schema, tableName: "approval_item" });
  },
};
