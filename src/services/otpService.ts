import { generateOTP } from '../utils/otp';

interface OTPData {
  code: string;
  email: string;
  expiresAt: Date;
  verified: boolean;
}

class OTPService {
  private otpStore: Map<string, OTPData> = new Map();
  private readonly OTP_EXPIRY_MINUTES = 10; // OTP expires in 10 minutes

  /**
   * Generate and store OTP for an email
   */
  generateAndStoreOTP(email: string): string {
    const code = generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.OTP_EXPIRY_MINUTES);

    this.otpStore.set(email.toLowerCase(), {
      code,
      email: email.toLowerCase(),
      expiresAt,
      verified: false,
    });

    // Clean up expired OTPs
    this.cleanupExpiredOTPs();

    return code;
  }

  /**
   * Verify OTP code for an email
   */
  verifyOTP(email: string, code: string): boolean {
    const emailKey = email.toLowerCase();
    const otpData = this.otpStore.get(emailKey);

    if (!otpData) {
      return false;
    }

    // Check if OTP has expired
    if (new Date() > otpData.expiresAt) {
      this.otpStore.delete(emailKey);
      return false;
    }

    // Check if code matches (case insensitive)
    if (otpData.code.toUpperCase() !== code.toUpperCase()) {
      return false;
    }

    // Mark as verified
    otpData.verified = true;
    this.otpStore.set(emailKey, otpData);

    return true;
  }

  /**
   * Check if OTP is verified for an email
   */
  isOTPVerified(email: string): boolean {
    const emailKey = email.toLowerCase();
    const otpData = this.otpStore.get(emailKey);
    return otpData?.verified === true;
  }

  /**
   * Remove OTP after use
   */
  removeOTP(email: string): void {
    this.otpStore.delete(email.toLowerCase());
  }

  /**
   * Clean up expired OTPs
   */
  private cleanupExpiredOTPs(): void {
    const now = new Date();
    for (const [email, otpData] of this.otpStore.entries()) {
      if (now > otpData.expiresAt) {
        this.otpStore.delete(email);
      }
    }
  }

  /**
   * Get remaining time for OTP (in minutes)
   */
  getRemainingTime(email: string): number | null {
    const emailKey = email.toLowerCase();
    const otpData = this.otpStore.get(emailKey);

    if (!otpData) {
      return null;
    }

    const now = new Date();
    if (now > otpData.expiresAt) {
      return null;
    }

    const diff = otpData.expiresAt.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60)); // Convert to minutes
  }
}

export const otpService = new OTPService();





