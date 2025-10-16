'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('applications', 'is_analytics', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indicates if the application should be shown in analytics section'
    });

    // Add index for better query performance
    await queryInterface.addIndex('applications', ['is_analytics'], {
      name: 'idx_applications_is_analytics'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove index first
    await queryInterface.removeIndex('applications', 'idx_applications_is_analytics');
    
    // Remove column
    await queryInterface.removeColumn('applications', 'is_analytics');
  }
};
