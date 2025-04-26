"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = process.env.DB_SCHEMA || "public"; // Default to 'public' schema
    console.log(schema, "schema")
    await queryInterface.createTable(
      { schema: schema, tableName: "users_hierarchy_new" },
      {
        users_hierarchy_id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        supervisor_designation_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: { schema: schema, tableName: "designation" },
            key: "designation_id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        officer_designation_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: { schema: schema, tableName: "designation" },
            key: "designation_id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
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

    // Add CHECK constraints
    await queryInterface.sequelize.query(`
      ALTER TABLE ${schema}.users_hierarchy_new
      ADD CONSTRAINT users_hierarchy_officer_designation_id_check CHECK (officer_designation_id > 0)
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE ${schema}.users_hierarchy_new
      ADD CONSTRAINT users_hierarchy_supervisor_designation_id_check CHECK (supervisor_designation_id > 0)
    `);
  },

  async down(queryInterface, Sequelize) {
    const schema = process.env.DB_SCHEMA || "public";
    await queryInterface.dropTable({ schema: schema, tableName: "users_hierarchy_new" });
  },
};
