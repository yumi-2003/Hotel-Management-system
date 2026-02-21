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
    from: `${process.env.EMAIL_FROM_NAME || 'Hotel Spa'} <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your Password Reset Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #0F2F2F; text-align: center;">Password Reset Request</h2>
        <p>Hello,</p>
        <p>You requested to reset your password. Use the following 6-digit verification code to proceed:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0;">
          <h1 style="color: #spa-teal; font-size: 32px; letter-spacing: 5px; margin: 0;">${code}</h1>
        </div>
        <p>This code will expire in 10 minutes. If you did not request this reset, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #888; text-align: center;">
          &copy; ${new Date().getFullYear()} Hotel Spa Management System. All rights reserved.
        </p>
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
