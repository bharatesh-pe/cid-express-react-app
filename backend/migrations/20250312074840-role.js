'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = process.env.DB_SCHEMA || 'cms'; // Get schema from .env

    await queryInterface.createTable(
      { tableName: 'role', schema }, // Ensure schema is used
      {
        role_id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        role_title: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        role_description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        user_mgnt: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
        },
        master: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
        },
        ui_case: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
        },
        pt_case: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
        },
        trial_case: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
        },
        quick_report: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
        },
        create_case: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
        },
        view_case: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
        },
        edit_case: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
        },
        delete_case: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
        },
        created_by: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      }
    );
  },

  async down(queryInterface, Sequelize) {
    const schema = process.env.DB_SCHEMA || 'cms';

    await queryInterface.dropTable({ tableName: 'role', schema });
  }
};
