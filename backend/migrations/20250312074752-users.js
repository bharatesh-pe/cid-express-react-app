'use strict';

require('dotenv').config(); // Load environment variables

module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = process.env.DB_SCHEMA || 'public'; // Get schema from .env

    await queryInterface.createTable(
      { tableName: 'users', schema }, // Include schema
      {
        user_id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        role_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: { tableName: 'role', schema }, // Reference role table in schema
            key: 'role_id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        name: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        kgid: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        cug_no: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        created_by: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          allowNull: true,
        },
        dev_status: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
          allowNull: true,
        },
      }
    );
  },

  async down(queryInterface, Sequelize) {
    const schema = process.env.DB_SCHEMA || 'public'; // Use schema from .env
    await queryInterface.dropTable({ tableName: 'users', schema });
  },
};
