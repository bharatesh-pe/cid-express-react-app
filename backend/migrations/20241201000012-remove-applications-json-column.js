'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove the applications JSON column
    await queryInterface.removeColumn('users', 'applications');
  },

  async down(queryInterface, Sequelize) {
    // Add back the applications JSON column
    await queryInterface.addColumn('users', 'applications', {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: '[]'
    });
  }
};
