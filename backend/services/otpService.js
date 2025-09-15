const axios = require('axios');
const crypto = require('crypto');

class OTPService {
  constructor() {
    // Karnataka SMS Gateway credentials (from cop-mob project)
    this.username = process.env.SMS_USERNAME || "Mobile_1-BCPSRV";
    this.password = process.env.SMS_PASSWORD || "bcpsrv@1234";
    this.senderId = process.env.SMS_SENDER_ID || "BCPSRV";
    this.deptSecureKey = process.env.SMS_DEPT_SECURE_KEY || "b30c8bcd-5034-458e-8466-54e2eeebe0a9";
    this.templateId = process.env.SMS_TEMPLATE_ID || "1107175198611559794";
    this.smsUrl = process.env.SMS_URL || "http://smsmobile1.karnataka.gov.in/index.php/sendmsg";
  }

  // Generate random OTP (same as cop-mob project)
  generateOTP(length = 6) {
    const keys = range(1, 9);
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += keys[Math.floor(Math.random() * keys.length)];
    }
    return otp;
  }

  // Send OTP via Karnataka SMS Gateway (based on cop-mob implementation)
  async sendOTP(mobile, userId) {
    try {
      const otp = this.generateOTP();
      const message = `MOB app OTP: ${otp}. Use to verify access. Do not share. - Commissioner of Police, Bengaluru`;
      
      // Encrypt password
      const encryptedPassword = crypto.createHash('sha1').update(this.password.trim()).digest('hex');
      
      // Generate key
      const key = crypto.createHash('sha512').update(
        this.username.trim() + 
        this.senderId.trim() + 
        message.trim() + 
        this.deptSecureKey.trim()
      ).digest('hex');

      const data = {
        username: this.username.trim(),
        password: encryptedPassword,
        senderid: this.senderId.trim(),
        content: message.trim(),
        smsservicetype: "otpmsg",
        mobileno: mobile.trim(),
        key: key.trim(),
        templateid: this.templateId.trim()
      };

      // Send SMS via Karnataka SMS Gateway
      const response = await this.postToUrl(this.smsUrl, data);
      
      console.log(`OTP sent to ${mobile}: ${response}`);
      return { success: true, messageId: response, otp };
      
    } catch (error) {
      console.error('Error sending OTP:', error);
      
      // Fallback: Log OTP to console for development
      const otp = this.generateOTP();
      console.log(`\n=== OTP for ${mobile} ===`);
      console.log(`OTP: ${otp}`);
      console.log(`Message: MOB app OTP: ${otp}. Use to verify access. Do not share. - Commissioner of Police, Bengaluru`);
      console.log('========================\n');
      
      return { success: true, messageId: 'console-log', otp };
    }
  }

  // HTTP POST request (same as cop-mob project)
  async postToUrl(url, data) {
    try {
      const formData = new URLSearchParams();
      Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
      });

      const response = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000
      });

      return response.data;
    } catch (error) {
      console.error('SMS Gateway error:', error.message);
      throw error;
    }
  }

  // Verify OTP format
  validateOTPFormat(otp) {
    return /^\d{6}$/.test(otp);
  }

  // Verify mobile number format
  validateMobileFormat(mobile) {
    return /^[6-9]\d{9}$/.test(mobile);
  }
}

// Helper function to create range (same as cop-mob project)
function range(start, end) {
  const result = [];
  for (let i = start; i <= end; i++) {
    result.push(i);
  }
  return result;
}

module.exports = new OTPService();
