'use strict';

require('dotenv').config();

module.exports = {
  async up(queryInterface, Sequelize) {
    const schema = process.env.DB_SCHEMA || 'public';

    // First create the trigger function
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION ${schema}.trigger_set_timestamp()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryInterface.createTable(
      { tableName: 'kgid', schema },
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
          unique: true,
        },
        kgid: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        mobile: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        start_date: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        end_date: {
          type: Sequelize.DATE,
          allowNull: true, // Allow NULL to match the model
        },
        created_by: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        updated_by: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      }
    );

    // Create trigger on the table
    await queryInterface.sequelize.query(`
      CREATE TRIGGER update_kgid_updated_at
      BEFORE UPDATE ON ${schema}.kgid
      FOR EACH ROW
      EXECUTE FUNCTION ${schema}.trigger_set_timestamp();
    `);
  },

  async down(queryInterface, Sequelize) {
    const schema = process.env.DB_SCHEMA || 'public';
    
    // Drop trigger first
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS update_kgid_updated_at ON ${schema}.kgid;
    `);
    
    // Drop function
    await queryInterface.sequelize.query(`
      DROP FUNCTION IF EXISTS ${schema}.trigger_set_timestamp();
    `);
    
    // Drop table
    await queryInterface.dropTable({ tableName: 'kgid', schema });
  },
};