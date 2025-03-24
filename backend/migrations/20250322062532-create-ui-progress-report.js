'use strict';

require('dotenv').config();

module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = process.env.DB_SCHEMA || 'public';

    await queryInterface.createTable(
      { tableName: 'ui_progress_report_file_status', schema },
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
          unique: true,
        },
        ui_case_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        is_pdf: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
        },
        file_name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        file_path: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        created_by: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        created_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          allowNull: false,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
      }
    );
  },

  async down(queryInterface, Sequelize) {
    const schema = process.env.DB_SCHEMA || 'public';
    await queryInterface.dropTable({ tableName: 'ui_progress_report_file_status', schema });
  },
};