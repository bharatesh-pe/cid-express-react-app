"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = process.env.DB_SCHEMA || "public"; // Default schema

    await queryInterface.createTable(
      { schema: schema, tableName: "module" },
      {
        module_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        name: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        ui_name: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        location: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        active_location: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        is_main_module: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
        },
        sub_modules: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        is_sub_module: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
        },
        order: {  // <-- Added this field
          type: Sequelize.INTEGER,
          allowNull: true, // Change to false if required
        },
      }
    );
  },

  async down(queryInterface, Sequelize) {
    const schema = process.env.DB_SCHEMA || "public";
    await queryInterface.dropTable({ schema: schema, tableName: "module" });
  },
};
