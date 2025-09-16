const { sequelize } = require('../config/database');
const User = require('../models/User');

async function testGetProfile() {
  try {
    console.log('Testing getProfile method...');

    // Test with admin user (ID: 15)
    const user = await User.findByPk(15);
    if (!user) {
      console.log('❌ Admin user not found');
      return;
    }

    console.log('✅ Found admin user:', user.user_name, '(ID:', user.id + ')');

    // Test getProfile method
    const profile = await user.getProfile();
    console.log('\nProfile result:');
    console.log('Applications:', profile.applications);
    console.log('Applications count:', profile.applications.length);
    
    if (profile.applications.length > 0) {
      console.log('✅ SUCCESS: Applications are being retrieved correctly!');
    } else {
      console.log('❌ FAILED: Applications array is still empty');
    }

  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

testGetProfile();
