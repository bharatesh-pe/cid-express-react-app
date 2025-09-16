'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First, check what users exist in the database
    const users = await queryInterface.sequelize.query(
      'SELECT id, user_name FROM users ORDER BY id',
      { type: Sequelize.QueryTypes.SELECT }
    );

    console.log('Found users:', users);

    if (users.length === 0) {
      console.log('No users found in database. Skipping user_applications insertion.');
      return;
    }

    // Create user-application relationships based on existing users
    const userApplications = [];

    // Find admin user (assuming first user is admin or user with isAdmin=true)
    const adminUser = users.find(u => u.user_name === 'admin') || users[0];
    
    if (adminUser) {
      // Admin gets all applications
      const allApplications = [
        'SIIMS', 'Snapshot', 'PMMC', 'Rowdy Sheeter', 'Muddemal', 'MOB', 
        'BCP Chat', 'NDPS Analytics', 'Tapal Tracker', 'Crime Analytics', 
        'DMS', 'Inventory Management', 'Lokayukta Digitalization', 'Dex-P', 'CMS', 'CNR'
      ];
      
      allApplications.forEach(appCode => {
        userApplications.push({
          userId: adminUser.id,
          applicationCode: appCode,
          isActive: true,
          assignedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        });
      });
    }

    // Add specific applications for other users based on their names
    users.forEach(user => {
      if (user.user_name === 'police_officer_1') {
        ['SIIMS', 'Snapshot', 'PMMC', 'Rowdy Sheeter', 'Muddemal'].forEach(appCode => {
          userApplications.push({
            userId: user.id,
            applicationCode: appCode,
            isActive: true,
            assignedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
          });
        });
      } else if (user.user_name === 'police_officer_2') {
        ['MOB', 'BCP Chat', 'NDPS Analytics', 'Tapal Tracker', 'Crime Analytics'].forEach(appCode => {
          userApplications.push({
            userId: user.id,
            applicationCode: appCode,
            isActive: true,
            assignedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
          });
        });
      } else if (user.user_name === 'fire_officer') {
        ['DMS', 'Inventory Management'].forEach(appCode => {
          userApplications.push({
            userId: user.id,
            applicationCode: appCode,
            isActive: true,
            assignedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
          });
        });
      } else if (user.user_name === 'lokayukta_officer') {
        userApplications.push({
          userId: user.id,
          applicationCode: 'Lokayukta Digitalization',
          isActive: true,
          assignedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } else if (user.user_name === 'excise_officer') {
        userApplications.push({
          userId: user.id,
          applicationCode: 'Dex-P',
          isActive: true,
          assignedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } else if (user.user_name === 'cid_officer') {
        ['CMS', 'CNR'].forEach(appCode => {
          userApplications.push({
            userId: user.id,
            applicationCode: appCode,
            isActive: true,
            assignedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
          });
        });
      }
    });

    if (userApplications.length > 0) {
      await queryInterface.bulkInsert('user_applications', userApplications);
      console.log(`Inserted ${userApplications.length} user-application relationships`);
    } else {
      console.log('No user-application relationships to insert');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('user_applications', null, {});
  }
};
