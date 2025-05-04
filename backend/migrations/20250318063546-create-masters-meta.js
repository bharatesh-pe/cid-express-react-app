'use strict';

const { or } = require('sequelize');

require('dotenv').config();

module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = process.env.DB_SCHEMA || 'public';

    await queryInterface.createTable(
      { tableName: 'masters_meta', schema },
      {
        masters_meta_id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
          unique: true
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false
        },
        key: {
          type: Sequelize.STRING,
          allowNull: false
        },
        created_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          allowNull: false
        },
        order: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
      }
    );
  },

  async down(queryInterface, Sequelize) {
    const schema = process.env.DB_SCHEMA || 'public';
    await queryInterface.dropTable({ tableName: 'masters_meta', schema });
  },
};