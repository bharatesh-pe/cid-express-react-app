const { sequelize } = require('../config/database');
const User = require('../models/User');
const Application = require('../models/Application');
const UserApplication = require('../models/UserApplication');

async function testUserProfile() {
  try {
    console.log('Testing user profile generation...');

    // Import models and set up associations
    User.associate({ User, Application, UserApplication, OTP: {} });
    Application.associate({ User, Application, UserApplication, OTP: {} });
    UserApplication.associate({ User, Application, UserApplication, OTP: {} });

    // Test with admin user (ID: 15)
    const user = await User.findByPk(15);
    if (!user) {
      console.log('❌ Admin user not found');
      return;
    }

    console.log('✅ Found admin user:', user.user_name);

    // Test getProfile method
    const profile = await user.getProfile();
    console.log('\nUser Profile:');
    console.log('ID:', profile.id);
    console.log('Username:', profile.user_name);
    console.log('Mobile:', profile.mobile_number);
    console.log('Applications:', profile.applications);
    console.log('Is Admin:', profile.isAdmin);

    // Test direct UserApplication query
    const userApps = await UserApplication.findAll({
      where: { userId: user.id, isActive: true }
    });
    console.log('\nDirect UserApplication query:');
    console.log('Found', userApps.length, 'applications');
    userApps.forEach(ua => {
      console.log(`  - ${ua.applicationCode}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

testUserProfile();
