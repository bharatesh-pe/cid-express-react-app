"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = process.env.DB_SCHEMA || "public"; // Default schema

    await queryInterface.createTable(
      { schema: schema, tableName: "users_department" },
      {
        users_department_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: { schema: schema, tableName: "users" },
            key: "user_id",
          },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },
        department_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: { schema: schema, tableName: "department" },
            key: "department_id",
          },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },
        created_by: {
          type: Sequelize.INTEGER,
          allowNull: true,
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
      }
    );
  },

  async down(queryInterface, Sequelize) {
    const schema = process.env.DB_SCHEMA || "public";
    await queryInterface.dropTable({ schema: schema, tableName: "users_department" });
  },
};
