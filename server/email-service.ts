import { MailService } from '@sendgrid/mail';
import { User } from '@shared/schema';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendPasswordResetEmail(
  user: User,
  resetToken: string
): Promise<boolean> {
  const resetUrl = `${process.env.VITE_APP_URL || 'http://localhost:5000'}/reset-password?token=${resetToken}`;
  
  const emailContent = {
    to: user.email,
    from: 'noreply@theenchantedco.com',
    subject: 'Reset Your Password - The Enchanted Co.',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Your Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3c5679 0%, #8e9aaf 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #3c5679; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>The Enchanted Co.</h1>
            <p>Your trusted childcare partner</p>
          </div>
          <div class="content">
            <h2>Password Reset Request</h2>
            <p>Hi ${user.fullName},</p>
            <p>We received a request to reset your password for your The Enchanted Co. account.</p>
            <p>Click the button below to create a new password:</p>
            <a href="${resetUrl}" class="button">Reset My Password</a>
            <p>This link will expire in 1 hour for security reasons.</p>
            <p>If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.</p>
            <p>If you're having trouble clicking the button, copy and paste this URL into your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          </div>
          <div class="footer">
            <p>This email was sent by The Enchanted Co. childcare platform.</p>
            <p>If you have questions, please contact our support team.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Hi ${user.fullName},

      We received a request to reset your password for your The Enchanted Co. account.

      Please visit the following link to create a new password:
      ${resetUrl}

      This link will expire in 1 hour for security reasons.

      If you didn't request this password reset, you can safely ignore this email.

      Best regards,
      The Enchanted Co. Team
    `
  };

  try {
    await mailService.send(emailContent);
    console.log(`Password reset email sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}