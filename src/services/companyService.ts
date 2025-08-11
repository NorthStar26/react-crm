import { fetchData } from '../components/FetchData';
import { CompaniesUrl } from './ApiUrls';

export interface CompanyOption {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  industry?: string;
}

/**
 * Fetches companies with optional search/filter parameters
 * @param searchTerm Optional search term to filter companies by name
 * @param limit Maximum number of results to return
 * @param offset Pagination offset
 * @returns Promise with company data
 */
export const fetchCompanyOptions = async (searchTerm = '', limit = 10, offset = 0) => {
  const token = localStorage.getItem('Token');
  const cleanToken = token ? token.replace(/^Bearer\s+/, '') : '';
  const Header = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: cleanToken ? `Bearer ${cleanToken}` : '',
    org: localStorage.getItem('org'),
  };

  try {
    // Build request URL with search parameter if provided
    let url = `${CompaniesUrl}?offset=${offset}&limit=${limit}`;
    if (searchTerm) url += `&name=${searchTerm}`;

    const response = await fetchData(url, 'GET', null as any, Header);
    
    if (!response.error) {
      // Map API response to CompanyOption format
      const companyOptions: CompanyOption[] = (response.results || []).map((company: any) => ({
        id: company.id,
        name: company.name || 'Unnamed Company',
        email: company.email,
        phone: company.phone,
        industry: company.industry
      }));
      
      return {
        options: companyOptions,
        total: response.total || 0,
        error: null
      };
    } else {
      console.error('Error in fetchCompanyOptions:', response.error);
      return {
        options: [],
        total: 0,
        error: response.error || 'Failed to fetch companies'
      };
    }
  } catch (error) {
    console.error('Exception in fetchCompanyOptions:', error);
    return {
      options: [],
      total: 0,
      error: 'An error occurred while fetching companies'
    };
  }
};
