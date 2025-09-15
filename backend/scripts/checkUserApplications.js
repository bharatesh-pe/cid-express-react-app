const { sequelize } = require('../config/database');

async function checkUserApplications() {
  try {
    console.log('Checking user applications...');

    // Get all users
    const users = await sequelize.query(
      'SELECT id, user_name, mobile_number, isAdmin FROM users ORDER BY id',
      { type: sequelize.QueryTypes.SELECT }
    );

    console.log('\nUsers in database:');
    users.forEach(user => {
      console.log(`ID: ${user.id}, Username: ${user.user_name}, Mobile: ${user.mobile_number}, Admin: ${user.isAdmin}`);
    });

    // Get all applications
    const applications = await sequelize.query(
      'SELECT id, code FROM applications ORDER BY id',
      { type: sequelize.QueryTypes.SELECT }
    );

    console.log('\nApplications in database:');
    applications.forEach(app => {
      console.log(`ID: ${app.id}, Code: ${app.code}`);
    });

    // Get user-application relationships
    const userApps = await sequelize.query(
      'SELECT userId, applicationCode FROM user_applications WHERE isActive = true ORDER BY userId, applicationCode',
      { type: sequelize.QueryTypes.SELECT }
    );

    console.log('\nUser-Application relationships:');
    if (userApps.length === 0) {
      console.log('No user-application relationships found!');
    } else {
      userApps.forEach(ua => {
        console.log(`User ${ua.userId} -> ${ua.applicationCode}`);
      });
    }

    // Show summary for each user
    console.log('\nUser Access Summary:');
    users.forEach(user => {
      const userAppCodes = userApps
        .filter(ua => ua.userId === user.id)
        .map(ua => ua.applicationCode);
      
      console.log(`${user.user_name} (ID: ${user.id}): ${userAppCodes.length} applications - [${userAppCodes.join(', ')}]`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkUserApplications();
