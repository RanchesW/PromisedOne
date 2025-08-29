import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    try {
      // Configure based on environment variables (support multiple naming conventions for production)
      const emailConfig = {
        host: process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true' || process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER || process.env.EMAIL_USER,
          pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
        },
      };

      console.log('Email service configuration:', {
        host: emailConfig.host,
        port: emailConfig.port,
        secure: emailConfig.secure,
        hasUser: !!emailConfig.auth.user,
        hasPass: !!emailConfig.auth.pass
      });

      // Only create transporter if credentials are provided
      if (emailConfig.auth.user && emailConfig.auth.pass) {
        this.transporter = nodemailer.createTransport(emailConfig);
        console.log('✅ Email transporter initialized');
      } else {
        console.log('⚠️ Email credentials not provided, email service disabled');
      }
    } catch (error) {
      console.error('❌ Failed to initialize email transporter:', error);
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      console.log('Email service not configured, skipping email send');
      return false;
    }

    try {
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'KazRPG'}" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', {
        to: options.to,
        subject: options.subject,
        messageId: result.messageId
      });
      return true;
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      return false;
    }
  }

  // Email verification code
  async sendVerificationEmail(email: string, verificationCode: string, firstName?: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Verify Your Email - KazRPG</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .verification-code { 
            background: #1f2937; color: white; padding: 15px; 
            font-size: 24px; font-weight: bold; text-align: center; 
            border-radius: 6px; margin: 20px 0; letter-spacing: 3px; 
          }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎲 Welcome to KazRPG!</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName || 'Adventurer'}!</h2>
            <p>Thank you for joining KazRPG! To complete your registration and start your tabletop RPG journey, please verify your email address.</p>
            
            <p><strong>Your verification code is:</strong></p>
            <div class="verification-code">${verificationCode}</div>
            
            <p>Enter this code on the verification page to activate your account.</p>
            
            <p><strong>Important:</strong> This code will expire in 15 minutes for security purposes.</p>
            
            <p>If you didn't create an account with KazRPG, please ignore this email.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p>Welcome to the adventure! Once verified, you'll be able to:</p>
            <ul>
              <li>🎲 Join exciting RPG sessions</li>
              <li>🗺️ Find experienced Game Masters</li>
              <li>📅 Book your gaming sessions</li>
              <li>💬 Connect with the RPG community</li>
            </ul>
          </div>
          <div class="footer">
            <p>This email was sent by KazRPG. If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: '🎲 Verify Your Email - Welcome to KazRPG!',
      html
    });
  }

  // Welcome email after verification
  async sendWelcomeEmail(email: string, firstName?: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to KazRPG!</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .cta-button { 
            display: inline-block; background: #2563eb; color: white; 
            padding: 12px 24px; text-decoration: none; border-radius: 6px; 
            margin: 20px 0; font-weight: bold; 
          }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to KazRPG!</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName || 'Adventurer'}!</h2>
            <p>Your email has been successfully verified! Your KazRPG account is now active and ready to use.</p>
            
            <p>🎲 <strong>Your adventure begins now!</strong></p>
            
            <div style="text-align: center;">
              <a href="${process.env.CLIENT_URL || 'https://promised-one-client.vercel.app'}/games" class="cta-button">
                Explore Games Now
              </a>
            </div>
            
            <h3>What's next?</h3>
            <ul>
              <li>🔍 <strong>Browse Games:</strong> Find exciting RPG sessions to join</li>
              <li>🎭 <strong>Complete Your Profile:</strong> Let others know about your gaming preferences</li>
              <li>🗣️ <strong>Connect:</strong> Join our community of tabletop RPG enthusiasts</li>
              <li>📚 <strong>Learn:</strong> New to RPGs? Check out our beginner's guide</li>
            </ul>
            
            <p>If you have any questions or need help getting started, don't hesitate to reach out to our friendly community!</p>
          </div>
          <div class="footer">
            <p>Happy gaming! - The KazRPG Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: '🎉 Welcome to KazRPG - Your Adventure Begins!',
      html
    });
  }

  // General notification email
  async sendNotificationEmail(email: string, title: string, message: string, firstName?: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${title} - KazRPG</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #6366f1; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${title}</h1>
          </div>
          <div class="content">
            <h2>Hello ${firstName || 'Adventurer'}!</h2>
            <div style="white-space: pre-line;">${message}</div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p><a href="${process.env.CLIENT_URL || 'https://promised-one-client.vercel.app'}" style="color: #2563eb;">Visit KazRPG</a> to manage your account and explore more.</p>
          </div>
          <div class="footer">
            <p>This notification was sent by KazRPG. Visit your account settings to manage email preferences.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `${title} - KazRPG`,
      html
    });
  }

  // Test email connection
  async testConnection(): Promise<boolean> {
    if (!this.transporter) {
      console.log('Email service not configured');
      return false;
    }

    try {
      await this.transporter.verify();
      console.log('✅ Email service connection test successful');
      return true;
    } catch (error) {
      console.error('❌ Email service connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();
export default emailService;