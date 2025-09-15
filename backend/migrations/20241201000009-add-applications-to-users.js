'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add applications JSON field to users table
    await queryInterface.addColumn('users', 'applications', {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: '[]'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove applications field
    await queryInterface.removeColumn('users', 'applications');
  }
};
