const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

<<<<<<< HEAD
const sendSMS = async ({ message, mobile , template_id }) => {
=======
const sendSMS = async ({ message, mobile }) => {
>>>>>>> 9460ed9 (commiting the smsservice file)
  const {
    SMS_USERNAME,
    SMS_PASSWORD,
    SMS_SENDERID,
    SMS_SECURE_KEY,
<<<<<<< HEAD
  } = process.env;

  // Hash the password using MD5
  const md5Password = crypto.createHash('md5').update(SMS_PASSWORD.trim()).digest('hex');

=======
    SMS_TEMPLATE_ID,
  } = process.env;

>>>>>>> 9460ed9 (commiting the smsservice file)
  const key = crypto
    .createHash('sha512')
    .update(SMS_USERNAME.trim() + SMS_SENDERID.trim() + message.trim() + SMS_SECURE_KEY.trim())
    .digest('hex');

  const payload = new URLSearchParams({
<<<<<<< HEAD
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
=======
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
>>>>>>> 9460ed9 (commiting the smsservice file)
      payload.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
<<<<<<< HEAD
        timeout: 5000,
      }
    );

    console.log('SMS response:', response);
    if (!response.status || response.status !== 200  || response.statusText != "OK"){
      throw new Error(`SMS gateway responded with error: ${response.data}`);
    }
    
    return { status: 'success', httpStatus: response.status };
=======
      }
    );
    return response.data;
>>>>>>> 9460ed9 (commiting the smsservice file)
  } catch (error) {
    console.error('SMS send error:', error.response?.data || error.message);
    throw error;
  }
};

module.exports = { sendSMS };
<<<<<<< HEAD
=======

>>>>>>> 9460ed9 (commiting the smsservice file)
