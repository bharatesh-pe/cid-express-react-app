'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('profile_history', {
      profile_history_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      template_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'template', // Name of the related table
          key: 'template_id', // Name of the related column
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      table_row_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      user_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Users', // Name of the related table
          key: 'user_id', // Name of the related column
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      field_name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      updated_value: {
        allowNull: true,
        type: Sequelize.TEXT('long'),
      },
      old_value: {
        allowNull: true,
        type: Sequelize.TEXT('long'),
      },

      created_at: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: true,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('profile_history');
  },
};
