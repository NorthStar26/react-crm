import { fetchData } from '../components/FetchData';
import { ContactUrl } from './ApiUrls';

export interface ContactOption {
  id: string;
  first_name: string;
  last_name: string;
  primary_email?: string;
  mobile_number?: string;
  display_name?: string; // For convenience
}

/**
 * Fetches contacts with optional search/filter parameters
 * @param searchTerm Optional search term to filter contacts
 * @param companyId Optional company ID to filter contacts by company
 * @param limit Maximum number of results to return
 * @param offset Pagination offset
 * @returns Promise with contact data
 */
export const fetchContactOptions = async (
  searchTerm = '',
  companyId = '',
  limit = 10,
  offset = 0
) => {
  const token = localStorage.getItem('Token');
  const Header = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: token || '',
    org: localStorage.getItem('org'),
  };

  try {
    // Build request URL with parameters
    let url = `${ContactUrl}/?offset=${offset}&limit=${limit}`;
    if (searchTerm) url += `&search=${searchTerm}`;
    if (companyId) url += `&company=${companyId}`;

    const response = await fetchData(url, 'GET', null as any, Header);
    
    if (!response.error) {
      // Map API response to ContactOption format
      const contactOptions: ContactOption[] = (response.data?.contact_obj_list || []).map((contact: any) => ({
        id: contact.id,
        first_name: contact.first_name || '',
        last_name: contact.last_name || '',
        primary_email: contact.primary_email || '',
        mobile_number: contact.mobile_number || '',
        display_name: `${contact.first_name || ''} ${contact.last_name || ''}`.trim()
      }));
      
      return {
        options: contactOptions,
        total: response.data?.contacts_count || contactOptions.length,
        error: null
      };
    } else {
      console.error('Error in fetchContactOptions:', response.error);
      return {
        options: [],
        total: 0,
        error: response.error || 'Failed to fetch contacts'
      };
    }
  } catch (error) {
    console.error('Exception in fetchContactOptions:', error);
    return {
      options: [],
      total: 0,
      error: 'An error occurred while fetching contacts'
    };
  }
};
