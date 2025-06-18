const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

const sendSMS = async ({ message, mobile , template_id }) => {
  const {
    SMS_USERNAME,
    SMS_PASSWORD,
    SMS_SENDERID,
    SMS_SECURE_KEY,
  } = process.env;

  // Hash the password using MD5
  const md5Password = crypto.createHash('md5').update(SMS_PASSWORD.trim()).digest('hex');

  const key = crypto
    .createHash('sha512')
    .update(SMS_USERNAME.trim() + SMS_SENDERID.trim() + message.trim() + SMS_SECURE_KEY.trim())
    .digest('hex');

  const payload = new URLSearchParams({
    username: SMS_USERNAME.trim(),
    password: SMS_PASSWORD.trim(), 
    // password: md5Password, 
    senderid: SMS_SENDERID.trim(),
    content: message.trim(),
    smsservicetype: 'otpmsg',
    mobileno: mobile.trim(),
    key: key,
    templateid: template_id.trim(),
  });

  try {
    const smsUrl = encodeURI('http://smsmobile1.karnataka.gov.in/index.php/sendmsg');
    // const smsUrl = encodeURI('https://msdgweb.mgov.gov.in/esms/sendsmsrequestDLT');
    const response = await axios.post(
      smsUrl,
      payload.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 5000,
      }
    );

    console.log('SMS response:', response);
    if (!response.status || response.status !== 200  || response.statusText != "OK"){
      throw new Error(`SMS gateway responded with error: ${response.data}`);
    }
    
    return { status: 'success', httpStatus: response.status };
  } catch (error) {
    console.error('SMS send error:', error.response?.data || error.message);
    throw error;
  }
};

module.exports = { sendSMS };
