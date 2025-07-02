import { Client } from '@hubspot/api-client';

const hubspotClient = new Client({ accessToken: process.env.HUBSPOT_ACCESS_TOKEN });

export interface BetaContact {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  residency?: string;
}

export class HubSpotService {
  private customPropertiesCreated = false;
  private welcomeEmailTemplateId?: string;

  async ensureCustomProperties(): Promise<void> {
    if (this.customPropertiesCreated) return;

    try {
      // Create residency custom property
      await hubspotClient.crm.properties.coreApi.create('contacts', {
        name: 'country_of_residence',
        label: 'Country of Residence',
        type: 'string' as any,
        fieldType: 'text' as any,
        groupName: 'contactinformation',
        description: 'User\'s country of residence for geographic analysis',
        options: []
      });

      // Create beta-specific properties
      await hubspotClient.crm.properties.coreApi.create('contacts', {
        name: 'beta_signup_date',
        label: 'Beta Signup Date',
        type: 'datetime' as any,
        fieldType: 'date' as any,
        groupName: 'contactinformation',
        description: 'Date when user signed up for beta access',
        options: []
      });

      await hubspotClient.crm.properties.coreApi.create('contacts', {
        name: 'beta_status',
        label: 'Beta Status',
        type: 'enumeration' as any,
        fieldType: 'select' as any,
        groupName: 'contactinformation',
        description: 'Current status in beta program',
        options: [
          { label: 'Pending Review', value: 'pending', hidden: false },
          { label: 'Approved', value: 'approved', hidden: false },
          { label: 'Active User', value: 'active', hidden: false },
          { label: 'Inactive', value: 'inactive', hidden: false }
        ]
      });

      this.customPropertiesCreated = true;
      console.log('HubSpot custom properties created successfully');
    } catch (error: any) {
      // Properties might already exist, which is fine
      if (error.code !== 409) {
        console.error('Error creating custom properties:', error.message);
      }
      this.customPropertiesCreated = true;
    }
  }

  async createBetaContact(email: string, firstName?: string, lastName?: string, residency?: string): Promise<BetaContact> {
    await this.ensureCustomProperties();

    try {
      const contactData = {
        properties: {
          email: email,
          firstname: firstName || '',
          lastname: lastName || '',
          company: residency || 'Unknown Location',
          country: residency || '',
          country_of_residence: residency || '',
          beta_signup_date: new Date().toISOString(),
          beta_status: 'pending'
        },
        associations: []
      };

      console.log(`Creating HubSpot contact with data:`, JSON.stringify(contactData.properties, null, 2));

      const response = await hubspotClient.crm.contacts.basicApi.create(contactData);

      console.log(`Beta contact created: ${email} from ${residency || 'Unknown'}`);
      console.log(`HubSpot response properties:`, JSON.stringify(response.properties, null, 2));

      return {
        id: response.id,
        email: response.properties.email || email,
        firstName: response.properties.firstname || firstName,
        lastName: response.properties.lastname || lastName,
        residency: response.properties.country_of_residence || residency
      };
    } catch (error) {
      console.error('HubSpot contact creation failed:', error);
      throw new Error('Failed to register beta user in CRM');
    }
  }

  async checkEmailExists(email: string): Promise<boolean> {
    try {
      const response = await hubspotClient.crm.contacts.searchApi.doSearch({
        filterGroups: [{
          filters: [{
            propertyName: 'email',
            operator: 'EQ' as any,
            value: email
          }]
        }],
        properties: ['email'],
        limit: 1
      });

      return response.results.length > 0;
    } catch (error) {
      console.error('HubSpot email check failed:', error);
      return false;
    }
  }

  async updateBetaStatus(contactId: string, status: 'pending' | 'approved' | 'active' | 'inactive' | 'blocked' | 'deleted'): Promise<void> {
    try {
      await hubspotClient.crm.contacts.basicApi.update(contactId, {
        properties: {
          beta_status: status
        }
      });
      console.log(`Updated contact ${contactId} to status: ${status}`);
    } catch (error) {
      console.error('Failed to update beta status:', error);
    }
  }

  async createWelcomeEmailTemplate(): Promise<string> {
    try {
      const hubspotRequest = new Client({ accessToken: process.env.HUBSPOT_ACCESS_TOKEN });
      
      // Use the transactional email API which is better for welcome emails
      const emailTemplate = {
        name: "AffluentEdge Beta Welcome Email",
        subject: "Welcome to AffluentEdge Beta - Your AI Trading Journey Begins",
        htmlBody: this.getWelcomeEmailHTML(),
        emailType: "AUTOMATED_EMAIL"
      };

      const response = await hubspotRequest.apiRequest({
        method: 'POST',
        path: '/marketing/v3/transactional-emails/single-send/create',
        body: emailTemplate
      });

      console.log('HubSpot Template Creation Response:', JSON.stringify(response, null, 2));
      
      const templateId = response.id || response.body?.id || response.data?.id || 'welcome-template';
      this.welcomeEmailTemplateId = templateId;
      console.log(`Created HubSpot email template with ID: ${templateId}`);
      return templateId;
    } catch (error) {
      console.error('Failed to create HubSpot email template:', error);
      // Fallback to a default template ID
      this.welcomeEmailTemplateId = 'welcome-template-fallback';
      return this.welcomeEmailTemplateId;
    }
  }

  async sendWelcomeEmail(contactId: string, email: string, firstName?: string): Promise<boolean> {
    try {
      const hubspotRequest = new Client({ accessToken: process.env.HUBSPOT_ACCESS_TOKEN });
      
      // Use HubSpot's Single Send API for transactional emails
      const emailData = {
        emailId: "AffluentEdgeWelcome", // Use a custom email ID
        message: {
          to: email,
          from: "info@affluentedge.app",
          subject: "Welcome to AffluentEdge Beta - Your AI Trading Journey Begins",
          htmlBody: this.getWelcomeEmailHTML().replace('{{contact.firstname}}', firstName || 'Trader').replace('{{contact.email}}', email)
        },
        contactProperties: {
          email: email,
          firstname: firstName || 'Trader'
        },
        customProperties: {
          login_url: `https://affluentedge.app/auth?email=${encodeURIComponent(email)}&action=login`
        }
      };

      const response = await hubspotRequest.apiRequest({
        method: 'POST',
        path: '/marketing/v3/transactional/single-email/send',
        body: emailData
      });

      console.log('HubSpot Email Send Response:', JSON.stringify(response, null, 2));
      console.log(`Welcome email sent via HubSpot to: ${email}`);
      return true;
    } catch (error) {
      console.error('Failed to send welcome email via HubSpot:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // Try alternative endpoint
      try {
        const alternativeData = {
          from: "info@affluentedge.app",
          to: [email],
          subject: "Welcome to AffluentEdge Beta - Your AI Trading Journey Begins",
          htmlContent: this.getWelcomeEmailHTML().replace('{{contact.firstname}}', firstName || 'Trader').replace('{{contact.email}}', email)
        };

        await hubspotRequest.apiRequest({
          method: 'POST',
          path: '/marketing/v3/emails/send-email',
          body: alternativeData
        });

        console.log(`Welcome email sent via HubSpot alternative endpoint to: ${email}`);
        return true;
      } catch (alternativeError) {
        console.error('Alternative endpoint also failed:', alternativeError);
        return false;
      }
    }
  }

  private getWelcomeEmailHTML(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to AffluentEdge Beta</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Inter', Arial, sans-serif;
            background-color: #000000;
            color: #FFFFFF;
            line-height: 1.6;
        }
        
        .email-container { max-width: 600px; margin: 0 auto; background-color: #000000; }
        
        .header {
            background: linear-gradient(135deg, #F9E086 0%, #E4BB76 100%);
            padding: 40px 30px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        
        .logo { font-size: 32px; font-weight: 700; color: #000000; margin-bottom: 10px; }
        .tagline { font-size: 16px; color: #000000; opacity: 0.8; }
        .content { padding: 40px 30px; background-color: #000000; }
        .greeting { font-size: 24px; font-weight: 600; color: #F9E086; margin-bottom: 20px; }
        .paragraph { font-size: 16px; margin-bottom: 24px; color: #FFFFFF; opacity: 0.9; }
        
        .features-list {
            background: rgba(249, 224, 134, 0.1);
            border: 1px solid rgba(249, 224, 134, 0.2);
            border-radius: 8px;
            padding: 24px;
            margin: 24px 0;
        }
        
        .features-title { font-size: 18px; font-weight: 600; color: #F9E086; margin-bottom: 16px; }
        .feature-item { display: flex; align-items: center; margin-bottom: 12px; font-size: 15px; }
        
        .feature-icon {
            width: 20px; height: 20px; background-color: #E4BB76; border-radius: 50%;
            margin-right: 12px; display: flex; align-items: center; justify-content: center;
            font-weight: bold; color: #000000; font-size: 12px;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #F9E086 0%, #E4BB76 100%);
            color: #000000;
            font-weight: 600;
            font-size: 16px;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 8px;
            margin: 24px 0;
            text-align: center;
        }
        
        .support-section {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            padding: 24px;
            margin: 24px 0;
            text-align: center;
        }
        
        .support-title { font-size: 18px; font-weight: 600; color: #F9E086; margin-bottom: 12px; }
        .support-text { font-size: 15px; margin-bottom: 16px; opacity: 0.9; }
        .support-email { color: #E4BB76; text-decoration: none; font-weight: 500; }
        
        .footer {
            padding: 30px;
            text-align: center;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            opacity: 0.7;
        }
        
        @media only screen and (max-width: 600px) {
            .email-container { width: 100% !important; }
            .header, .content, .footer { padding: 24px 20px !important; }
            .logo { font-size: 28px !important; }
            .greeting { font-size: 22px !important; }
            .cta-button { display: block !important; width: 100% !important; }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">AffluentEdge</div>
            <div class="tagline">Premium AI Trading Journal</div>
        </div>
        
        <div class="content">
            <div class="greeting">Welcome to the future of trading, {{contact.firstname}}!</div>
            
            <div class="paragraph">
                Thank you for joining the AffluentEdge beta program. We're thrilled to have you as one of our select early users who will shape the future of AI-powered trading analysis.
            </div>
            
            <div class="paragraph">
                AffluentEdge is more than just a trading journal – it's your intelligent trading partner that combines sophisticated trade analysis, custom strategy validation, and community insights to elevate your trading performance.
            </div>
            
            <div class="features-list">
                <div class="features-title">What makes AffluentEdge special:</div>
                <div class="feature-item">
                    <div class="feature-icon">🤖</div>
                    <div>AI-powered trade analysis with GPT-4 grading and insights</div>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">📊</div>
                    <div>Advanced performance metrics and equity curve visualization</div>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">⚡</div>
                    <div>Natural language trade entry - just describe your trades</div>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">🎯</div>
                    <div>Custom strategy validation and adherence scoring</div>
                </div>
                <div class="feature-item">
                    <div class="feature-icon">👥</div>
                    <div>Community features to connect with other elite traders</div>
                </div>
            </div>
            
            <div style="text-align: center;">
                <a href="https://affluentedge.app/auth?email={{contact.email}}&action=login" class="cta-button">Access AffluentEdge Now</a>
            </div>
            
            <div class="support-section">
                <div class="support-title">Need Help Getting Started?</div>
                <div class="support-text">
                    Our team is here to ensure you have an exceptional experience. If you have any questions or need assistance, don't hesitate to reach out.
                </div>
                <div>
                    Contact us: <a href="mailto:support@affluentedge.app" class="support-email">support@affluentedge.app</a>
                </div>
            </div>
            
            <div class="paragraph">
                As a beta user, your feedback is invaluable to us. We'd love to hear about your experience, suggestions for improvements, and any features you'd like to see.
            </div>
            
            <div class="paragraph">
                Welcome to the AffluentEdge community – where intelligent trading meets exceptional results.
            </div>
            
            <div class="paragraph" style="margin-top: 32px;">
                Best regards,<br>
                <strong>The AffluentEdge Team</strong>
            </div>
        </div>
        
        <div class="footer">
            <div style="font-size: 14px; margin-bottom: 8px;">© 2025 AffluentEdge. All rights reserved.</div>
            <div style="font-size: 14px; margin-bottom: 8px;">This email was sent to {{contact.email}} because you signed up for AffluentEdge beta access.</div>
        </div>
    </div>
</body>
</html>`;
  }

  async getBetaApplicants(): Promise<Array<{
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    residency?: string;
    betaStatus: 'pending' | 'approved' | 'active' | 'inactive' | 'blocked' | 'deleted';
    signupDate: string;
  }>> {
    try {
      const response = await hubspotClient.crm.contacts.searchApi.doSearch({
        filterGroups: [{
          filters: [{
            propertyName: 'beta_status',
            operator: 'HAS_PROPERTY' as any
          }]
        }],
        properties: [
          'email', 
          'firstname', 
          'lastname', 
          'beta_status', 
          'beta_signup_date', 
          'country_of_residence',
          'createdate'
        ],
        sorts: ['createdate'],
        limit: 100
      });

      return response.results
        .map(contact => ({
          id: contact.id,
          email: contact.properties.email || '',
          firstName: contact.properties.firstname || '',
          lastName: contact.properties.lastname || '',
          residency: contact.properties.country_of_residence || '',
          betaStatus: (contact.properties.beta_status as any) || 'pending',
          signupDate: contact.properties.beta_signup_date || contact.properties.createdate || new Date().toISOString()
        }))
        .filter(contact => contact.betaStatus !== 'deleted'); // Filter out deleted users
    } catch (error) {
      console.error('Failed to fetch beta applicants:', error);
      return [];
    }
  }
}

export const hubspotService = new HubSpotService();