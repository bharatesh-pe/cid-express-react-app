'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('approval_activity_logs', {
      log_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      approval_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
     },
      approval_item_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      case_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      approved_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      approved_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      approval_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      module: {   
        type: Sequelize.STRING,
        allowNull: true,
     },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },

    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('approval_activity_logs');
  },
};
