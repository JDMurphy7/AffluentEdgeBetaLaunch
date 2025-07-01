import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface EmailTemplateData {
  firstName: string;
  email: string;
  loginUrl: string;
  unsubscribeUrl?: string;
}

export class EmailService {
  private readonly fromEmail = 'info@affluentedge.app';
  private readonly baseUrl: string;

  constructor() {
    // Use environment variable or default to localhost for development
    this.baseUrl = process.env.BASE_URL || 'https://localhost:5000';
  }

  async sendWelcomeEmail(data: EmailTemplateData): Promise<boolean> {
    try {
      // Load the HTML template
      const templatePath = path.join(__dirname, '../templates/welcome-email.html');
      let htmlContent = fs.readFileSync(templatePath, 'utf-8');

      // Replace template variables
      htmlContent = htmlContent
        .replace(/\{\{firstName\}\}/g, data.firstName || 'Trader')
        .replace(/\{\{email\}\}/g, data.email)
        .replace(/\{\{loginUrl\}\}/g, data.loginUrl)
        .replace(/\{\{unsubscribeUrl\}\}/g, data.unsubscribeUrl || `${this.baseUrl}/unsubscribe`);

      // Log the email content for development/testing
      console.log(`Welcome email prepared for ${data.email}`);
      console.log(`Login URL: ${data.loginUrl}`);
      
      // In production, you would integrate with an email service like:
      // - SendGrid
      // - Mailgun
      // - AWS SES
      // - Postmark
      
      // For now, we'll log the email and save it as a file for testing
      await this.saveEmailForTesting(data.email, htmlContent);
      
      return true;
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return false;
    }
  }

  private async saveEmailForTesting(email: string, htmlContent: string): Promise<void> {
    try {
      // Create emails directory if it doesn't exist
      const emailsDir = path.join(__dirname, '../emails');
      if (!fs.existsSync(emailsDir)) {
        fs.mkdirSync(emailsDir, { recursive: true });
      }

      // Save email as HTML file for preview
      const filename = `welcome-${email.replace('@', '-at-')}-${Date.now()}.html`;
      const filepath = path.join(emailsDir, filename);
      
      fs.writeFileSync(filepath, htmlContent);
      console.log(`Welcome email saved for preview at: ${filepath}`);
    } catch (error) {
      console.error('Failed to save email for testing:', error);
    }
  }

  // Method to integrate with real email services (example for SendGrid)
  async sendWithSendGrid(to: string, subject: string, htmlContent: string): Promise<boolean> {
    // Example SendGrid integration (requires @sendgrid/mail package)
    /*
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to,
      from: this.fromEmail,
      subject,
      html: htmlContent,
    };

    try {
      await sgMail.send(msg);
      return true;
    } catch (error) {
      console.error('SendGrid error:', error);
      return false;
    }
    */
    
    console.log('SendGrid integration not implemented yet');
    return false;
  }

  // Method to integrate with Mailgun
  async sendWithMailgun(to: string, subject: string, htmlContent: string): Promise<boolean> {
    // Example Mailgun integration (requires mailgun-js package)
    /*
    const mailgun = require('mailgun-js')({
      apiKey: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN
    });

    const data = {
      from: this.fromEmail,
      to,
      subject,
      html: htmlContent
    };

    try {
      await mailgun.messages().send(data);
      return true;
    } catch (error) {
      console.error('Mailgun error:', error);
      return false;
    }
    */
    
    console.log('Mailgun integration not implemented yet');
    return false;
  }

  generateLoginUrl(email: string): string {
    // Generate a secure login URL - in production you'd want to use a proper token system
    return `${this.baseUrl}/auth?email=${encodeURIComponent(email)}&action=login`;
  }
}

export const emailService = new EmailService();