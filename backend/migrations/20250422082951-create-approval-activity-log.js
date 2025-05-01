'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("approval_activity_logs", {
      log_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      approval_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      case_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      field_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      old_value: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      updated_value: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("approval_activity_logs");
  },
};
