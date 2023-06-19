const otpGenerator = require('otp-generator');

const client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

const generateOtp = () => {
  return otpGenerator.generate(6, {
    upperCase: false,
    specialChars: false,
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false
  });
};

const sendOtp = async (mobileNumber, otp) => {
  try {
    await client.messages.create({
      body: `ProGear OTP: ${otp}`,
      from: '+13613488421',
      to: `+91${mobileNumber}`,
    });
  } catch (error) {
    console.log(error.message);
    throw new Error("Failed to send OTP");
  }
};

module.exports = { generateOtp,sendOtp};