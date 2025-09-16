'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      mobile: {
        type: Sequelize.STRING(10),
        allowNull: false,
        unique: true
      },
      designation: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      departments: {
        type: Sequelize.JSON,
        allowNull: false
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      isAdmin: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      lastLogin: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('users', ['mobile']);
    await queryInterface.addIndex('users', ['username']);
    await queryInterface.addIndex('users', ['isActive']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};
