/**
 * Generate a random OTP code (5 characters: numbers and letters)
 */
export const generateOTP = (): string => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let otp = '';
  
  for (let i = 0; i < 5; i++) {
    otp += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return otp;
};

/**
 * Validate OTP format (5 alphanumeric characters)
 */
export const validateOTPFormat = (otp: string): boolean => {
  const otpRegex = /^[A-Z0-9]{5}$/;
  return otpRegex.test(otp.toUpperCase());
};





