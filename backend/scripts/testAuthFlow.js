const { sequelize } = require('../config/database');
const User = require('../models/User');
const UserApplication = require('../models/UserApplication');

async function testAuthFlow() {
  try {
    console.log('Testing authentication flow...');

    // Test with admin user (mobile: 9698273271)
    const mobile_number = '9698273271';
    
    // Find user by mobile
    const user = await User.findByMobile(mobile_number);
    if (!user) {
      console.log('❌ User not found with mobile:', mobile_number);
      return;
    }

    console.log('✅ Found user:', user.user_name, '(ID:', user.id + ')');

    // Test getProfile method
    console.log('\nTesting getProfile method...');
    const profile = await user.getProfile();
    console.log('Profile applications:', profile.applications);
    console.log('Profile applications count:', profile.applications.length);

    // Test direct UserApplication query
    console.log('\nTesting direct UserApplication query...');
    const userApps = await UserApplication.findAll({
      where: { 
        userId: user.id,
        isActive: true 
      }
    });
    console.log('Direct query found', userApps.length, 'applications:');
    userApps.forEach(ua => {
      console.log(`  - ${ua.applicationCode}`);
    });

    // Test the exact query used in getProfile
    console.log('\nTesting exact getProfile query...');
    const UserApplicationModel = require('./UserApplication');
    const userApplications = await UserApplicationModel.findAll({
      where: { 
        userId: user.id,
        isActive: true 
      }
    });
    const applications = userApplications.map(ua => ua.applicationCode);
    console.log('Applications from getProfile query:', applications);
    console.log('Count:', applications.length);

  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

testAuthFlow();
