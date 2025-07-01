import { Client } from '@hubspot/api-client';

const hubspotClient = new Client({ accessToken: process.env.HUBSPOT_ACCESS_TOKEN });

export interface SimpleBetaContact {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export class SimpleHubSpotService {
  async createSimpleContact(email: string, firstName?: string, lastName?: string): Promise<SimpleBetaContact> {
    try {
      const response = await hubspotClient.crm.contacts.basicApi.create({
        properties: {
          email: email,
          firstname: firstName || '',
          lastname: lastName || ''
        },
        associations: []
      });

      return {
        id: response.id,
        email: response.properties.email || email,
        firstName: response.properties.firstname || firstName,
        lastName: response.properties.lastname || lastName
      };
    } catch (error) {
      console.error('HubSpot simple contact creation failed:', error);
      throw new Error('Failed to register beta user in CRM');
    }
  }

  async checkSimpleEmailExists(email: string): Promise<boolean> {
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
}

export const simpleHubspotService = new SimpleHubSpotService();