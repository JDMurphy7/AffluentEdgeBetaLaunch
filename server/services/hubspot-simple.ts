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

  async updateBetaStatus(contactId: string, status: 'pending' | 'approved' | 'active' | 'inactive'): Promise<void> {
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
}

export const hubspotService = new HubSpotService();