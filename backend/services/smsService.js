const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

const sendSMS = async ({ message, mobile }) => {
  const {
    SMS_USERNAME,
    SMS_PASSWORD,
    SMS_SENDERID,
    SMS_SECURE_KEY,
    SMS_TEMPLATE_ID,
  } = process.env;

  const key = crypto
    .createHash('sha512')
    .update(SMS_USERNAME.trim() + SMS_SENDERID.trim() + message.trim() + SMS_SECURE_KEY.trim())
    .digest('hex');

  const payload = new URLSearchParams({
    username: SMS_USERNAME,
    password: SMS_PASSWORD,
    senderid: SMS_SENDERID,
    content: message.trim(),
    smsservicetype: 'singlemsg',
    mobileno: mobile.trim(),
    key,
    templateid: SMS_TEMPLATE_ID,
  });

  try {
    const response = await axios.post(
      'https://msdgweb.mgov.gov.in/esms/sendsmsrequestDLT',
      payload.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    console.log('SMS sent successfully:', response.data);
    if (response.data.status !== 'success') {
      throw new Error(`SMS sending failed: ${response.data}`);
    }
    return response.data;
  } catch (error) {
    console.error('SMS send error:', error.response?.data || error.message);
    throw error;
  }
};

module.exports = { sendSMS };

