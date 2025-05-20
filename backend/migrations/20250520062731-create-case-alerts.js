'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('case_alerts', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      module: {
        type: Sequelize.STRING,
      },
      main_table: {
        type: Sequelize.STRING,
      },
      record_id: {
        type: Sequelize.INTEGER,
      },
      alert_type: {
        type: Sequelize.STRING,
      },
      alert_level: {
        type: Sequelize.STRING,
      },
      alert_message: {
        type: Sequelize.TEXT,
      },
      due_date: {
        type: Sequelize.DATE,
      },
      triggered_on: {
        type: Sequelize.DATE,
      },
      resolved_on: {
        type: Sequelize.DATE,
      },
      status: {
        type: Sequelize.STRING,
      },
      created_by: {
        type: Sequelize.INTEGER,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      send_to_type: {
        type: Sequelize.STRING,
      },
      division_id: {
        type: Sequelize.STRING,
      },
      designation_id: {
        type: Sequelize.STRING,
      },
      assigned_io: {
        type: Sequelize.STRING,
      },
      user_id: {
        type: Sequelize.STRING,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('case_alerts');
  },
};
