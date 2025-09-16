const mysql = require('mysql2/promise');

async function verifyData() {
  let connection;
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'police_app'
    });

    console.log('Connected to database successfully!');

    // Check users
    const [users] = await connection.execute('SELECT id, user_name, mobile_number, isAdmin FROM users ORDER BY id');
    console.log('\nUsers in database:');
    console.log('==================');
    users.forEach(user => {
      console.log(`ID: ${user.id}, Username: ${user.user_name}, Mobile: ${user.mobile_number}, Admin: ${user.isAdmin}`);
    });

    // Check applications
    const [applications] = await connection.execute('SELECT id, code FROM applications ORDER BY id');
    console.log('\nApplications in database:');
    console.log('=========================');
    applications.forEach(app => {
      console.log(`ID: ${app.id}, Code: ${app.code}`);
    });

    // Check user_applications
    const [userApps] = await connection.execute('SELECT userId, applicationCode FROM user_applications ORDER BY userId, applicationCode');
    console.log('\nUser Applications in database:');
    console.log('===============================');
    userApps.forEach(ua => {
      console.log(`User ${ua.userId} -> ${ua.applicationCode}`);
    });

    console.log(`\nTotal user-application relationships: ${userApps.length}`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

verifyData();
