import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendResetCodeEmail = async (email: string, code: string): Promise<void> => {
  const mailOptions = {
    from: `${process.env.EMAIL_FROM_NAME || 'Comftay Hotel'} <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your Password Reset Code – Comftay Hotel',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0d9488, #0f766e); padding: 32px 24px; text-align: center;">
          <p style="color: rgba(255,255,255,0.7); font-size: 11px; letter-spacing: 4px; text-transform: uppercase; margin: 0 0 8px 0;">🏨 Comftay Hotel</p>
          <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 0;">Password Reset Request</h1>
        </div>
        <!-- Body -->
        <div style="padding: 32px 28px;">
          <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 12px 0;">Hello,</p>
          <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">You requested to reset your password for your Comftay Hotel account. Use the following 6-digit verification code to proceed:</p>
          <div style="background: linear-gradient(135deg, #f0fdfa, #ccfbf1); border: 2px solid #0d9488; padding: 24px; text-align: center; border-radius: 14px; margin: 0 0 24px 0;">
            <p style="color: #6b7280; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin: 0 0 8px 0;">Your Reset Code</p>
            <h2 style="color: #0f766e; font-size: 40px; letter-spacing: 10px; margin: 0; font-weight: 900; font-family: monospace;">${code}</h2>
          </div>
          <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin: 0 0 8px 0;">⏱ This code will expire in <strong>10 minutes</strong>.</p>
          <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin: 0;">If you did not request this reset, you can safely ignore this email.</p>
        </div>
        <!-- Footer -->
        <div style="background-color: #f9fafb; border-top: 1px solid #e5e7eb; padding: 20px 28px; text-align: center;">
          <p style="font-size: 12px; color: #9ca3af; margin: 0;">
            &copy; ${new Date().getFullYear()} Comftay Hotel Management System. All rights reserved.
          </p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Reset email sent to ${email}: ${info.messageId}`);
  } catch (error: any) {
    console.error('Error sending reset email (transporter):', error.message || error);
    
    // DEVELOPMENT FALLBACK: Log code to console so testing can continue
    console.warn('\n' + '='.repeat(50));
    console.warn('📧 [DEVELOPMENT FALLBACK] EMAIL SENDING FAILED');
    console.warn(`TO: ${email}`);
    console.warn(`RESET CODE: ${code}`);
    console.warn('='.repeat(50) + '\n');

    // If we want to allow the process to continue in dev even if email fails:
    if (process.env.NODE_ENV !== 'production') {
       console.log('Allowing request to succeed (Development Fallback enabled)');
       return;
    }
    
    throw error;
  }
};
