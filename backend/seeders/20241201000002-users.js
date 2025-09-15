'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Insert users
    await queryInterface.bulkInsert('users', [
      {
        user_name: 'admin',
        mobile_number: '9698273271',
        isActive: true,
        isAdmin: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_name: 'police_officer_1',
        mobile_number: '9876543211',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_name: 'police_officer_2',
        mobile_number: '9876543212',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_name: 'fire_officer',
        mobile_number: '9876543213',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_name: 'lokayukta_officer',
        mobile_number: '9876543214',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_name: 'excise_officer',
        mobile_number: '9876543215',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_name: 'cid_officer',
        mobile_number: '9876543216',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

    // Wait a moment for the users to be committed
    await new Promise(resolve => setTimeout(resolve, 100));

    // Insert user-application relationships
    const userApplications = [
      // Admin has all applications
      { userId: 1, applicationCode: 'SIIMS' },
      { userId: 1, applicationCode: 'Snapshot' },
      { userId: 1, applicationCode: 'PMMC' },
      { userId: 1, applicationCode: 'Rowdy Sheeter' },
      { userId: 1, applicationCode: 'Muddemal' },
      { userId: 1, applicationCode: 'MOB' },
      { userId: 1, applicationCode: 'BCP Chat' },
      { userId: 1, applicationCode: 'NDPS Analytics' },
      { userId: 1, applicationCode: 'Tapal Tracker' },
      { userId: 1, applicationCode: 'Crime Analytics' },
      { userId: 1, applicationCode: 'DMS' },
      { userId: 1, applicationCode: 'Inventory Management' },
      { userId: 1, applicationCode: 'Lokayukta Digitalization' },
      { userId: 1, applicationCode: 'Dex-P' },
      { userId: 1, applicationCode: 'CMS' },
      { userId: 1, applicationCode: 'CNR' },
      
      // Police Officer 1
      { userId: 2, applicationCode: 'SIIMS' },
      { userId: 2, applicationCode: 'Snapshot' },
      { userId: 2, applicationCode: 'PMMC' },
      { userId: 2, applicationCode: 'Rowdy Sheeter' },
      { userId: 2, applicationCode: 'Muddemal' },
      
      // Police Officer 2
      { userId: 3, applicationCode: 'MOB' },
      { userId: 3, applicationCode: 'BCP Chat' },
      { userId: 3, applicationCode: 'NDPS Analytics' },
      { userId: 3, applicationCode: 'Tapal Tracker' },
      { userId: 3, applicationCode: 'Crime Analytics' },
      
      // Fire Officer
      { userId: 4, applicationCode: 'DMS' },
      { userId: 4, applicationCode: 'Inventory Management' },
      
      // Lokayukta Officer
      { userId: 5, applicationCode: 'Lokayukta Digitalization' },
      
      // Excise Officer
      { userId: 6, applicationCode: 'Dex-P' },
      
      // CID Officer
      { userId: 7, applicationCode: 'CMS' },
      { userId: 7, applicationCode: 'CNR' }
    ];

    await queryInterface.bulkInsert('user_applications', userApplications.map(ua => ({
      ...ua,
      isActive: true,
      assignedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    })), {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
