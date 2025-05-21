import sgMail from '@sendgrid/mail';
import { User } from '@shared/schema';

// Initialize SendGrid with API key
if (!process.env.SENDGRID_API_KEY) {
  console.warn('Warning: SENDGRID_API_KEY is not set. Email functionality will not work.');
} else {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

/**
 * Send welcome email to new parent users
 */
export async function sendWelcomeEmail(user: User): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('Warning: Cannot send welcome email, SENDGRID_API_KEY is not set.');
    return false;
  }

  if (user.userType !== 'parent') {
    // Only send welcome emails to parents
    return false;
  }

  try {
    const msg = {
      to: user.email,
      from: 'hello@lovetheenchantedco.com', // Your verified sender
      subject: 'Welcome to the Enchanted Co! 🧸',
      text: `Welcome to The Enchanted Co. We're excited to have you on board!
      
Here's what you can do next:
- Complete your profile – This helps us and our caregivers learn more about you
- Explore the dashboard – get familiar with the tools and features.
- Start Booking - Book care with confidence! Our caregivers are background checked and reviewed by our team.
- Reach out anytime – our support team is here to help at hello@lovetheenchantedco.com

If you have any questions or feedback, don't hesitate to send us an email. We're here to help!

Welcome to the Enchanted Co Family! 🎉`,
      html: `
        <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://lovetheenchantedco.com/logo.png" alt="The Enchanted Co." style="max-width: 200px;">
          </div>
          
          <h1 style="color: #3c5679; font-size: 24px;">Welcome to The Enchanted Co. 🧸</h1>
          
          <p style="font-size: 16px; line-height: 1.5;">We're excited to have you on board!</p>
          
          <div style="margin: 30px 0; background-color: #f5f8ff; border-left: 4px solid #3c5679; padding: 15px;">
            <h2 style="color: #3c5679; font-size: 18px; margin-top: 0;">Here's what you can do next:</h2>
            
            <ul style="padding-left: 20px; line-height: 1.6;">
              <li><strong>Complete your profile</strong> – This helps us and our caregivers learn more about you</li>
              <li><strong>Explore the dashboard</strong> – get familiar with the tools and features</li>
              <li><strong>Start Booking</strong> - Book care with confidence! Our caregivers are background checked and reviewed by our team</li>
              <li><strong>Reach out anytime</strong> – our support team is here to help at <a href="mailto:hello@lovetheenchantedco.com" style="color: #3c5679;">hello@lovetheenchantedco.com</a></li>
            </ul>
          </div>
          
          <p style="font-size: 16px; line-height: 1.5;">If you have any questions or feedback, don't hesitate to send us an email. We're here to help!</p>
          
          <p style="font-size: 16px; line-height: 1.5; margin-top: 30px; font-weight: bold;">Welcome to the Enchanted Co Family! 🎉</p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #666;">
            <p>The Enchanted Co. | <a href="https://lovetheenchantedco.com" style="color: #3c5679;">lovetheenchantedco.com</a></p>
          </div>
        </div>
      `,
    };

    await sgMail.send(msg);
    console.log(`Welcome email sent successfully to ${user.email}`);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
}