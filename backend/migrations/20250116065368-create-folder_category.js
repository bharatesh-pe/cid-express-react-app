'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('folder_categories', {
      folder_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      folder_name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        default: true,
      },
      created_by: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      created_date: {
        allowNull: true,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      modified_by: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      modified_date: {
        allowNull: true,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('folder_categories');
  }
};