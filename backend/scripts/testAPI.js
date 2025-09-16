const axios = require('axios');

async function testAPI() {
  try {
    console.log('Testing API endpoints...');

    // Test applications endpoint
    const applicationsResponse = await axios.get('http://localhost:5000/api/applications');
    console.log('\nApplications API Response:');
    console.log('Status:', applicationsResponse.status);
    console.log('Data:', JSON.stringify(applicationsResponse.data, null, 2));

    // Test health endpoint
    const healthResponse = await axios.get('http://localhost:5000/health');
    console.log('\nHealth API Response:');
    console.log('Status:', healthResponse.status);
    console.log('Data:', JSON.stringify(healthResponse.data, null, 2));

  } catch (error) {
    console.error('Error testing API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testAPI();
