const mysql = require('mysql2/promise');

async function checkUserData() {
  let connection;
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'test'
    });

    console.log('Connected to database successfully!');

    // Check users
    const [users] = await connection.execute('SELECT id, user_name, mobile_number, isAdmin FROM users ORDER BY id');
    console.log('\nUsers in database:');
    users.forEach(user => {
      console.log(`ID: ${user.id}, Username: ${user.user_name}, Mobile: ${user.mobile_number}, Admin: ${user.isAdmin}`);
    });

    // Check user_applications
    const [userApps] = await connection.execute('SELECT userId, applicationCode FROM user_applications WHERE isActive = true ORDER BY userId, applicationCode');
    console.log('\nUser-Application relationships:');
    if (userApps.length === 0) {
      console.log('❌ No user-application relationships found!');
    } else {
      console.log(`✅ Found ${userApps.length} user-application relationships:`);
      userApps.forEach(ua => {
        console.log(`  User ${ua.userId} -> ${ua.applicationCode}`);
      });
    }

    // Show summary for each user
    console.log('\nUser Access Summary:');
    users.forEach(user => {
      const userAppCodes = userApps
        .filter(ua => ua.userId === user.id)
        .map(ua => ua.applicationCode);
      
      if (userAppCodes.length === 0) {
        console.log(`❌ ${user.user_name} (ID: ${user.id}): NO APPLICATIONS`);
      } else {
        console.log(`✅ ${user.user_name} (ID: ${user.id}): ${userAppCodes.length} applications - [${userAppCodes.join(', ')}]`);
      }
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkUserData();
