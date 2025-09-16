'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('departments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      link: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      image: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      order: {
        type: Sequelize.INTEGER,
        defaultValue: 0
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
    await queryInterface.addIndex('departments', ['title']);
    await queryInterface.addIndex('departments', ['isActive']);
    await queryInterface.addIndex('departments', ['order']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('departments');
  }
};
