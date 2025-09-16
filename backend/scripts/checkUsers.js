const { sequelize } = require('../config/database');

async function checkUsers() {
  try {
    console.log('Connecting to database...');
    
    // Check users table
    const users = await sequelize.query('SELECT * FROM users ORDER BY id', { 
      type: sequelize.QueryTypes.SELECT 
    });
    
    console.log('Users in database:');
    console.log('==================');
    if (users.length === 0) {
      console.log('No users found in database');
    } else {
      users.forEach(user => {
        console.log(`ID: ${user.id}, Username: ${user.user_name}, Mobile: ${user.mobile_number}, Admin: ${user.isAdmin}`);
      });
    }
    
    // Check applications table
    const applications = await sequelize.query('SELECT * FROM applications ORDER BY id', { 
      type: sequelize.QueryTypes.SELECT 
    });
    
    console.log('\nApplications in database:');
    console.log('=========================');
    if (applications.length === 0) {
      console.log('No applications found in database');
    } else {
      applications.forEach(app => {
        console.log(`ID: ${app.id}, Code: ${app.code}`);
      });
    }
    
    // Check user_applications table
    const userApps = await sequelize.query('SELECT * FROM user_applications ORDER BY userId, applicationCode', { 
      type: sequelize.QueryTypes.SELECT 
    });
    
    console.log('\nUser Applications in database:');
    console.log('===============================');
    if (userApps.length === 0) {
      console.log('No user applications found');
    } else {
      userApps.forEach(ua => {
        console.log(`User ${ua.userId} -> ${ua.applicationCode}`);
      });
    }
    
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await sequelize.close();
  }
}

checkUsers();
