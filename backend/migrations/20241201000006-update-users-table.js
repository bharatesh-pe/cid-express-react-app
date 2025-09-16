'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Rename username column to user_name
    await queryInterface.renameColumn('users', 'username', 'user_name');
    
    // Rename mobile column to mobile_number
    await queryInterface.renameColumn('users', 'mobile', 'mobile_number');
    
    // Remove designation column
    await queryInterface.removeColumn('users', 'designation');
    
    // Remove departments JSON column
    await queryInterface.removeColumn('users', 'departments');
    
    // Update indexes
    await queryInterface.removeIndex('users', ['mobile']);
    await queryInterface.removeIndex('users', ['username']);
    await queryInterface.addIndex('users', ['mobile_number']);
    await queryInterface.addIndex('users', ['user_name']);
  },

  async down(queryInterface, Sequelize) {
    // Revert column renames
    await queryInterface.renameColumn('users', 'user_name', 'username');
    await queryInterface.renameColumn('users', 'mobile_number', 'mobile');
    
    // Add back designation column
    await queryInterface.addColumn('users', 'designation', {
      type: Sequelize.STRING(100),
      allowNull: false
    });
    
    // Add back departments JSON column
    await queryInterface.addColumn('users', 'departments', {
      type: Sequelize.JSON,
      allowNull: false
    });
    
    // Revert indexes
    await queryInterface.removeIndex('users', ['mobile_number']);
    await queryInterface.removeIndex('users', ['user_name']);
    await queryInterface.addIndex('users', ['mobile']);
    await queryInterface.addIndex('users', ['username']);
  }
};
