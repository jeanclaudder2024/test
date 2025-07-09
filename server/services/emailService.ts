import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Email service for sending verification emails
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configure your email service here
    // For development, you can use a service like Gmail, SendGrid, or Mailgun
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Generate verification token
  generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Send email verification
  async sendVerificationEmail(email: string, firstName: string, token: string): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/verify-email?token=${token}`;
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@petrodealhub.com',
      to: email,
      subject: 'Verify Your PetroDealHub Account',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">Welcome to PetroDealHub!</h1>
          </div>
          
          <div style="padding: 30px; background: #f8fafc;">
            <h2 style="color: #334155; margin-bottom: 20px;">Hi ${firstName},</h2>
            <p style="color: #64748b; line-height: 1.6; margin-bottom: 25px;">
              Thank you for registering with PetroDealHub! To complete your account setup and start exploring our maritime trading platform, please verify your email address.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #64748b; line-height: 1.6; margin-bottom: 20px;">
              If the button doesn't work, you can copy and paste this link into your browser:
            </p>
            <p style="color: #3b82f6; word-break: break-all; background: #f1f5f9; padding: 10px; border-radius: 4px;">
              ${verificationUrl}
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 14px; margin: 0;">
                This verification link will expire in 24 hours. If you didn't create an account with PetroDealHub, please ignore this email.
              </p>
            </div>
          </div>
          
          <div style="background: #334155; padding: 20px; text-align: center; color: #94a3b8; font-size: 14px;">
            <p style="margin: 0;">© 2025 PetroDealHub. All rights reserved.</p>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Verification email sent to ${email}`);
      return true;
    } catch (error) {
      console.log('Email service not configured - verification email skipped');
      return false;
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(email: string, firstName: string, token: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/reset-password?token=${token}`;
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@petrodealhub.com',
      to: email,
      subject: 'Reset Your PetroDealHub Password',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background: linear-gradient(135deg, #dc2626, #ef4444); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">Password Reset Request</h1>
          </div>
          
          <div style="padding: 30px; background: #f8fafc;">
            <h2 style="color: #334155; margin-bottom: 20px;">Hi ${firstName},</h2>
            <p style="color: #64748b; line-height: 1.6; margin-bottom: 25px;">
              You requested to reset your password for your PetroDealHub account. Click the button below to create a new password.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: linear-gradient(135deg, #dc2626, #ef4444); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #64748b; line-height: 1.6; margin-bottom: 20px;">
              If the button doesn't work, you can copy and paste this link into your browser:
            </p>
            <p style="color: #dc2626; word-break: break-all; background: #f1f5f9; padding: 10px; border-radius: 4px;">
              ${resetUrl}
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 14px; margin: 0;">
                This reset link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
              </p>
            </div>
          </div>
          
          <div style="background: #334155; padding: 20px; text-align: center; color: #94a3b8; font-size: 14px;">
            <p style="margin: 0;">© 2025 PetroDealHub. All rights reserved.</p>
          </div>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Password reset email sent to ${email}`);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }
}

export const emailService = new EmailService();