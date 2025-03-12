'use strict';

require('dotenv').config(); // Load environment variables

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = process.env.DB_SCHEMA || 'cms'; // Default to 'cid' if not set

    await queryInterface.createTable(
      { schema, tableName: 'auth_secure' },
      {
        auth_id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        kgid: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        pin: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        otp: {
          type: Sequelize.STRING,
          allowNull: true,
          defaultValue: '0',
        },
        otp_expires_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        no_of_attempts: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        last_attempt_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        dev_status: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
      }
    );

    // Add foreign key constraint
    await queryInterface.addConstraint(
      { schema, tableName: 'auth_secure' },
      {
        fields: ['user_id'],
        type: 'foreign key',
        name: 'auth_secure_user_id_fkey',
        references: {
          table: { schema, tableName: 'users' },
          field: 'user_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      }
    );
  },

  async down(queryInterface, Sequelize) {
    const schema = process.env.DB_SCHEMA || 'cid';
    await queryInterface.dropTable({ schema, tableName: 'auth_secure' });
  },
};
