'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('profile_history', {
      profile_history_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      template_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'templates',
          key: 'template_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      table_row_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      field_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      updated_value: {
        type: Sequelize.TEXT('long'),
        allowNull: true,
      },
      old_value: {
        type: Sequelize.TEXT('long'),
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('profile_history');
  },
};
