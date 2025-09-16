'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove individual application columns from users table
    const applicationColumns = [
      'has_siims',
      'has_snapshot', 
      'has_pmmc',
      'has_rowdy_sheeter',
      'has_muddemal',
      'has_mob',
      'has_bcp_chat',
      'has_ndps_analytics',
      'has_tapal_tracker',
      'has_crime_analytics',
      'has_dms',
      'has_inventory_management',
      'has_lokayukta_digitalization',
      'has_dex_p',
      'has_cms',
      'has_cnr'
    ];

    for (const column of applicationColumns) {
      try {
        await queryInterface.removeColumn('users', column);
      } catch (error) {
        // Column might not exist, continue
        console.log(`Column ${column} not found, continuing...`);
      }
    }
  },

  async down(queryInterface, Sequelize) {
    // Add back individual application columns
    const applicationColumns = [
      'has_siims',
      'has_snapshot', 
      'has_pmmc',
      'has_rowdy_sheeter',
      'has_muddemal',
      'has_mob',
      'has_bcp_chat',
      'has_ndps_analytics',
      'has_tapal_tracker',
      'has_crime_analytics',
      'has_dms',
      'has_inventory_management',
      'has_lokayukta_digitalization',
      'has_dex_p',
      'has_cms',
      'has_cnr'
    ];

    for (const column of applicationColumns) {
      await queryInterface.addColumn('users', column, {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      });
    }
  }
};
