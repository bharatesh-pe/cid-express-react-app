"use strict";

require("dotenv").config(); // Load .env variables

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = process.env.DB_SCHEMA || "public"; // Default schema
    console.log(schema,"sCHEMA")
    await queryInterface.sequelize.query(`CREATE SCHEMA IF NOT EXISTS ${schema};`);

    await queryInterface.createTable(
      { schema: schema, tableName: "act" },
      {
        act_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        act_name: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
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
    await queryInterface.dropTable({ schema: schema, tableName: "act" });
  },
};
