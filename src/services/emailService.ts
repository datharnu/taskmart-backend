import nodemailer from 'nodemailer';
import { getEnv } from '../utils/env';
import fs from 'fs';
import path from 'path';

interface EmailDraft {
  type: 'welcome' | 'signin';
  to: string;
  subject: string;
  html: string;
  text: string;
  timestamp: Date;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured: boolean = false;
  private draftMode: boolean = false;
  private draftsDir: string;

  constructor() {
    // Check if draft mode is enabled
    this.draftMode = process.env.EMAIL_DRAFT_MODE === 'true';
    this.draftsDir = path.resolve(__dirname, '../../email-drafts');
    
    // Create drafts directory if draft mode is enabled
    if (this.draftMode && !fs.existsSync(this.draftsDir)) {
      fs.mkdirSync(this.draftsDir, { recursive: true });
    }

    // Check if SMTP is configured
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;
    
    if (smtpUser && smtpPassword) {
      try {
        // Initialize email transporter
        // For production, use SMTP credentials from environment variables
        // For development, you can use services like Mailtrap, SendGrid, or Gmail
        this.transporter = nodemailer.createTransport({
          host: getEnv('SMTP_HOST', 'smtp.gmail.com'),
          port: parseInt(getEnv('SMTP_PORT', '587')),
          secure: false, // true for 465, false for other ports
          auth: {
            user: smtpUser,
            pass: smtpPassword,
          },
          // Add debug and logger for better error tracking
          debug: process.env.NODE_ENV === 'development',
          logger: process.env.NODE_ENV === 'development',
        });
        this.isConfigured = true;
        console.log('✅ Email service configured');
        console.log(`📧 SMTP Host: ${getEnv('SMTP_HOST', 'smtp.gmail.com')}`);
        console.log(`📧 SMTP Port: ${getEnv('SMTP_PORT', '587')}`);
        console.log(`📧 SMTP User: ${smtpUser}`);
      } catch (error) {
        console.warn('⚠️ Email service not configured. Emails will be skipped.');
        console.warn('Set SMTP_USER and SMTP_PASSWORD in .env to enable email notifications');
      }
    } else {
      console.warn('⚠️ Email service not configured. Emails will be skipped.');
      console.warn('Set SMTP_USER and SMTP_PASSWORD in .env to enable email notifications');
      console.warn('💡 Tip: Set EMAIL_DRAFT_MODE=true to save email drafts to files');
    }
  }

  /**
   * Save email draft to file
   */
  private saveDraft(draft: EmailDraft): void {
    if (!this.draftMode) return;

    const filename = `${draft.type}_${draft.to.replace('@', '_at_')}_${Date.now()}.html`;
    const filepath = path.join(this.draftsDir, filename);
    
    const draftContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Email Draft: ${draft.subject}</title>
  <style>
    body { font-family: monospace; padding: 20px; background: #f5f5f5; }
    .meta { background: #fff; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
    .meta p { margin: 5px 0; }
    .email-content { background: #fff; padding: 20px; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="meta">
    <h2>Email Draft</h2>
    <p><strong>Type:</strong> ${draft.type}</p>
    <p><strong>To:</strong> ${draft.to}</p>
    <p><strong>Subject:</strong> ${draft.subject}</p>
    <p><strong>Timestamp:</strong> ${draft.timestamp.toISOString()}</p>
  </div>
  <div class="email-content">
    ${draft.html}
  </div>
</body>
</html>
    `;

    fs.writeFileSync(filepath, draftContent);
    console.log(`📝 Email draft saved to: ${filepath}`);
  }

  /**
   * Log email draft to console
   */
  private logDraft(draft: EmailDraft): void {
    console.log('\n' + '='.repeat(80));
    console.log('📧 EMAIL DRAFT');
    console.log('='.repeat(80));
    console.log(`Type: ${draft.type}`);
    console.log(`To: ${draft.to}`);
    console.log(`Subject: ${draft.subject}`);
    console.log(`Timestamp: ${draft.timestamp.toISOString()}`);
    console.log('\n--- HTML Content ---');
    console.log(draft.html);
    console.log('\n--- Text Content ---');
    console.log(draft.text);
    console.log('='.repeat(80) + '\n');
  }

  /**
   * Send welcome email after signup
   */
  async sendWelcomeEmail(userEmail: string, userName: string | null): Promise<void> {
    const name = userName || 'there';
    
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to TaskMart</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #051A3A 0%, #49D6FF 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: #fff; margin: 0;">Welcome to TaskMart!</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #051A3A;">Hi ${name},</h2>
            <p>Thank you for signing up for TaskMart! We're excited to have you on board.</p>
            <p>TaskMart is your one-stop platform for managing tasks and connecting with others. You can now:</p>
            <ul style="list-style: none; padding: 0;">
              <li style="padding: 10px 0;">✓ Create and manage your tasks</li>
              <li style="padding: 10px 0;">✓ Connect with other users</li>
              <li style="padding: 10px 0;">✓ Explore the marketplace</li>
            </ul>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p style="margin-top: 30px;">Best regards,<br><strong>The TaskMart Team</strong></p>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </body>
        </html>
      `;

    const textContent = `
        Welcome to TaskMart!
        
        Hi ${name},
        
        Thank you for signing up for TaskMart! We're excited to have you on board.
        
        TaskMart is your one-stop platform for managing tasks and connecting with others.
        
        If you have any questions, feel free to reach out to our support team.
        
        Best regards,
        The TaskMart Team
      `;

    const mailOptions = {
      from: `"TaskMart" <${getEnv('SMTP_FROM_EMAIL', getEnv('SMTP_USER', 'noreply@taskmart.com'))}>`,
      to: userEmail,
      subject: 'Welcome to TaskMart! 🎉',
      html: htmlContent,
      text: textContent,
    };

    // Create and save/log draft
    const draft: EmailDraft = {
      type: 'welcome',
      to: userEmail,
      subject: mailOptions.subject,
      html: htmlContent,
      text: textContent,
      timestamp: new Date(),
    };

    // Always log draft
    this.logDraft(draft);
    
    // Save draft to file if draft mode is enabled
    if (this.draftMode) {
      this.saveDraft(draft);
    }

    if (!this.isConfigured || !this.transporter) {
      console.log(`📧 Welcome email skipped (email service not configured) for ${userEmail}`);
      console.log(`💡 To enable email sending, configure SMTP settings in .env`);
      console.log(`💡 To save email drafts, set EMAIL_DRAFT_MODE=true in .env`);
      return;
    }

    try {
      // Verify connection before sending
      await this.transporter.verify();
      console.log('✅ SMTP connection verified');
      
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Welcome email sent to ${userEmail}`);
      console.log(`📧 Message ID: ${info.messageId}`);
    } catch (error: any) {
      console.error('❌ Error sending welcome email:');
      console.error('Error details:', {
        code: error.code,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode,
        message: error.message,
      });
      
      if (error.code === 'EAUTH') {
        console.error('🔐 Authentication failed. Check your SMTP_USER and SMTP_PASSWORD');
        console.error('💡 For Gmail, make sure you\'re using an App Password, not your regular password');
      } else if (error.code === 'ECONNECTION') {
        console.error('🔌 Connection failed. Check your SMTP_HOST and SMTP_PORT');
      } else if (error.responseCode === 535) {
        console.error('🔐 Authentication failed. Invalid credentials');
      }
      
      // Don't throw error - email failure shouldn't break signup
    }
  }

  /**
   * Send signin notification email
   */
  async sendSigninNotificationEmail(userEmail: string, userName: string | null): Promise<void> {
    const name = userName || 'there';
    const signinTime = new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Sign-In Detected</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #051A3A 0%, #49D6FF 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: #fff; margin: 0;">New Sign-In Detected 🔐</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #051A3A;">Hi ${name},</h2>
            <p>We detected a new sign-in to your TaskMart account.</p>
            <div style="background: #fff; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #49D6FF;">
              <p style="margin: 0;"><strong>Sign-in Time:</strong> ${signinTime}</p>
            </div>
            <p style="background: #e3f2fd; padding: 15px; border-radius: 5px; border-left: 4px solid #2196f3;">
              <strong>✅ If this was you:</strong> You can safely ignore this email. No further action is needed.
            </p>
            <div style="background: #ffebee; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #d32f2f;">
              <p style="color: #d32f2f; margin-top: 0; font-weight: bold; font-size: 16px;">⚠️ If you didn't sign in:</p>
              <p style="margin-bottom: 10px;">Your account may have been accessed by someone else. Please take immediate action:</p>
              <ol style="margin: 0; padding-left: 20px;">
                <li style="padding: 8px 0;">
                  <strong>Reset your password immediately</strong> using the "Forgot Password" feature on the login page
                </li>
                <li style="padding: 8px 0;">
                  <strong>Review your account activity</strong> for any unauthorized changes
                </li>
                <li style="padding: 8px 0;">
                  <strong>Contact our support team</strong> if you notice any suspicious activity or need assistance
                </li>
              </ol>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="#" style="background: #051A3A; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Reset Password
              </a>
            </div>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 20px;">
              <p style="margin: 0; font-size: 14px;"><strong>Need Help?</strong></p>
              <p style="margin: 5px 0 0 0; font-size: 14px;">
                If you have any concerns about your account security, please reach out to our support team immediately.
                <br>
                <strong>Email:</strong> ${getEnv('SUPPORT_EMAIL', 'support@taskmart.com')}
              </p>
            </div>
            <p style="margin-top: 30px;">Best regards,<br><strong>The TaskMart Team</strong></p>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>This is an automated security email. Please do not reply to this message.</p>
            <p>If you have questions, contact our support team at support@taskmart.com</p>
          </div>
        </body>
        </html>
      `;

    const textContent = `
        New Sign-In Detected
        
        Hi ${name},
        
        We detected a new sign-in to your TaskMart account.
        
        Sign-in Time: ${signinTime}
        
        ✅ If this was you:
        You can safely ignore this email. No further action is needed.
        
        ⚠️ If you didn't sign in:
        Your account may have been accessed by someone else. Please take immediate action:
        
        1. Reset your password immediately using the "Forgot Password" feature on the login page
        2. Review your account activity for any unauthorized changes
        3. Contact our support team if you notice any suspicious activity or need assistance
        
        Need Help?
        If you have any concerns about your account security, please reach out to our support team immediately.
        Email: ${getEnv('SUPPORT_EMAIL', 'support@taskmart.com')}
        
        Best regards,
        The TaskMart Team
        
        ---
        This is an automated security email. Please do not reply to this message.
        If you have questions, contact our support team at support@taskmart.com
      `;

    const mailOptions = {
      from: `"TaskMart" <${getEnv('SMTP_FROM_EMAIL', getEnv('SMTP_USER', 'noreply@taskmart.com'))}>`,
      to: userEmail,
      subject: 'New Sign-In Detected 🔐',
      html: htmlContent,
      text: textContent,
    };

    // Create and save/log draft
    const draft: EmailDraft = {
      type: 'signin',
      to: userEmail,
      subject: mailOptions.subject,
      html: htmlContent,
      text: textContent,
      timestamp: new Date(),
    };

    // Always log draft
    this.logDraft(draft);
    
    // Save draft to file if draft mode is enabled
    if (this.draftMode) {
      this.saveDraft(draft);
    }

    if (!this.isConfigured || !this.transporter) {
      console.log(`📧 Signin notification email skipped (email service not configured) for ${userEmail}`);
      console.log(`💡 To enable email sending, configure SMTP settings in .env`);
      console.log(`💡 To save email drafts, set EMAIL_DRAFT_MODE=true in .env`);
      return;
    }

    try {
      // Verify connection before sending
      await this.transporter.verify();
      console.log('✅ SMTP connection verified');
      
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Signin notification email sent to ${userEmail}`);
      console.log(`📧 Message ID: ${info.messageId}`);
    } catch (error: any) {
      console.error('❌ Error sending signin notification email:');
      console.error('Error details:', {
        code: error.code,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode,
        message: error.message,
      });
      
      if (error.code === 'EAUTH') {
        console.error('🔐 Authentication failed. Check your SMTP_USER and SMTP_PASSWORD');
        console.error('💡 For Gmail, make sure you\'re using an App Password, not your regular password');
      } else if (error.code === 'ECONNECTION') {
        console.error('🔌 Connection failed. Check your SMTP_HOST and SMTP_PORT');
      } else if (error.responseCode === 535) {
        console.error('🔐 Authentication failed. Invalid credentials');
      }
      
      // Don't throw error - email failure shouldn't break signin
    }
  }

  /**
   * Send OTP email for password reset
   */
  async sendOTPEmail(userEmail: string, userName: string | null, otpCode: string): Promise<void> {
    const name = userName || 'there';
    
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset OTP</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #051A3A 0%, #49D6FF 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: #fff; margin: 0;">Password Reset 🔑</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #051A3A;">Hi ${name},</h2>
            <p>We received a request to reset your password for your TaskMart account.</p>
            <p>Use the following OTP code to verify your identity and reset your password:</p>
            <div style="background: #fff; padding: 30px; border-radius: 10px; margin: 30px 0; text-align: center; border: 2px dashed #49D6FF;">
              <div style="font-size: 48px; font-weight: bold; letter-spacing: 10px; color: #051A3A; font-family: 'Courier New', monospace;">
                ${otpCode}
              </div>
            </div>
            <p style="color: #d32f2f; font-weight: bold;">⚠️ Important:</p>
            <ul style="margin: 0; padding-left: 20px;">
              <li style="padding: 5px 0;">This OTP code will expire in 10 minutes</li>
              <li style="padding: 5px 0;">Do not share this code with anyone</li>
              <li style="padding: 5px 0;">If you didn't request this, please ignore this email</li>
            </ul>
            <p style="margin-top: 30px;">If you have any concerns, please contact our support team immediately.</p>
            <p style="margin-top: 30px;">Best regards,<br><strong>The TaskMart Team</strong></p>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>This is an automated email. Please do not reply.</p>
            <p>If you have questions, contact our support team at ${getEnv('SUPPORT_EMAIL', 'support@taskmart.com')}</p>
          </div>
        </body>
        </html>
      `;

    const textContent = `
        Password Reset
        
        Hi ${name},
        
        We received a request to reset your password for your TaskMart account.
        
        Use the following OTP code to verify your identity and reset your password:
        
        ${otpCode}
        
        ⚠️ Important:
        - This OTP code will expire in 10 minutes
        - Do not share this code with anyone
        - If you didn't request this, please ignore this email
        
        If you have any concerns, please contact our support team immediately.
        
        Best regards,
        The TaskMart Team
        
        ---
        This is an automated email. Please do not reply.
        If you have questions, contact our support team at ${getEnv('SUPPORT_EMAIL', 'support@taskmart.com')}
      `;

    const mailOptions = {
      from: `"TaskMart" <${getEnv('SMTP_FROM_EMAIL', getEnv('SMTP_USER', 'noreply@taskmart.com'))}>`,
      to: userEmail,
      subject: 'Password Reset OTP Code 🔑',
      html: htmlContent,
      text: textContent,
    };

    if (!this.isConfigured || !this.transporter) {
      console.log(`📧 OTP email skipped (email service not configured) for ${userEmail}`);
      console.log(`💡 OTP Code: ${otpCode} (for testing purposes)`);
      return;
    }

    try {
      await this.transporter.verify();
      console.log('✅ SMTP connection verified');
      
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ OTP email sent to ${userEmail}`);
      console.log(`📧 Message ID: ${info.messageId}`);
    } catch (error: any) {
      console.error('❌ Error sending OTP email:');
      console.error('Error details:', {
        code: error.code,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode,
        message: error.message,
      });
      console.log(`💡 OTP Code: ${otpCode} (for testing purposes)`);
    }
  }
}

export const emailService = new EmailService();

