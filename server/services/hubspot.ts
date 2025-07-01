import { Client } from '@hubspot/api-client';

const hubspotClient = new Client({ accessToken: process.env.HUBSPOT_ACCESS_TOKEN });

export interface BetaUserData {
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  tradingExperience?: string;
  assetClasses?: string[];
  source?: string;
}

export interface HubSpotContact {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  createdAt: string;
  lifecycleStage: string;
}

export class HubSpotService {
  async createBetaContact(userData: BetaUserData): Promise<HubSpotContact> {
    try {
      const properties = {
        email: userData.email,
        firstname: userData.firstName || '',
        lastname: userData.lastName || '',
        company: userData.company || '',
        lifecyclestage: 'lead'
      };

      const response = await hubspotClient.crm.contacts.basicApi.create({
        properties,
        associations: []
      });

      return {
        id: response.id,
        email: response.properties.email || '',
        firstName: response.properties.firstname || undefined,
        lastName: response.properties.lastname || undefined,
        company: response.properties.company || undefined,
        createdAt: response.properties.createdate || new Date().toISOString(),
        lifecycleStage: response.properties.lifecyclestage || 'lead'
      };
    } catch (error) {
      console.error('HubSpot contact creation failed:', error);
      throw new Error('Failed to register beta user in CRM');
    }
  }

  async updateBetaStatus(contactId: string, status: 'approved' | 'rejected' | 'active'): Promise<void> {
    try {
      // Update lifecycle stage based on status
      let lifecycleStage = 'lead';
      if (status === 'approved') lifecycleStage = 'marketingqualifiedlead';
      if (status === 'active') lifecycleStage = 'customer';
      
      await hubspotClient.crm.contacts.basicApi.update(contactId, {
        properties: {
          lifecyclestage: lifecycleStage
        }
      });
    } catch (error) {
      console.error('HubSpot status update failed:', error);
      throw new Error('Failed to update beta status');
    }
  }

  async getBetaContacts(limit: number = 100): Promise<HubSpotContact[]> {
    try {
      const response = await hubspotClient.crm.contacts.basicApi.getPage(
        limit,
        undefined,
        ['email', 'firstname', 'lastname', 'company', 'createdate', 'lifecyclestage']
      );

      return response.results.map(contact => ({
        id: contact.id,
        email: contact.properties.email || '',
        firstName: contact.properties.firstname || undefined,
        lastName: contact.properties.lastname || undefined,
        company: contact.properties.company || undefined,
        createdAt: contact.properties.createdate || new Date().toISOString(),
        lifecycleStage: contact.properties.lifecyclestage || 'lead'
      }));
    } catch (error) {
      console.error('HubSpot contacts retrieval failed:', error);
      throw new Error('Failed to retrieve beta contacts');
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

  async trackBetaEngagement(contactId: string, action: string, details?: any): Promise<void> {
    try {
      // For now, just update the last modified date by updating a standard field
      await hubspotClient.crm.contacts.basicApi.update(contactId, {
        properties: {
          lastname: (await this.getContactLastName(contactId)) || 'User'
        }
      });
    } catch (error) {
      console.error('HubSpot engagement tracking failed:', error);
      // Don't throw error for engagement tracking failures
    }
  }

  private async getContactLastName(contactId: string): Promise<string> {
    try {
      const contact = await hubspotClient.crm.contacts.basicApi.getById(contactId, ['lastname']);
      return contact.properties.lastname || '';
    } catch (error) {
      return '';
    }
  }
}

export const hubspotService = new HubSpotService();