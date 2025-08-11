import { fetchData } from '../components/FetchData';
import { UsersUrl } from './ApiUrls';

export interface UserOption {
  id: string; // This is the profile ID we need to use for assignment
  user_details?: {
    id: string; // This is the user's ID, not needed for assignment
    first_name: string;
    last_name: string;
    email: string;
    is_active?: boolean;
    profile_pic?: string | null;
  };
  // Address info
  address?: {
    address_line?: string;
    street?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
    country_display?: string;
  };
  // Keep the old properties for backward compatibility
  user__first_name?: string;
  user__last_name?: string;
  user__email?: string;
  role?: string;
  has_sales_access?: boolean;
  has_marketing_access?: boolean;
  is_active?: boolean;
  phone?: string;
  alternate_phone?: string;
  date_of_joining?: string | null;
  display_name?: string; // For convenience
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  created_on?: string;
  created_by?: {
    id: string;
    email: string;
  };
  users?: string[];
}

/**
 * Fetches users and teams from the API
 * @param searchTerm Optional search term to filter users
 * @returns Promise with user data
 */
export const fetchUserOptions = async (searchTerm = '') => {
  const token = localStorage.getItem('Token');
  const Header = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: token || '',
    org: localStorage.getItem('org'),
  };

  try {
    // Use the proper endpoint format that matches other services
    const url = `${UsersUrl}/get-teams-and-users/`;
    
    const response = await fetchData(url, 'GET', null as any, Header);
    
    if (!response.error) {
      // Log the raw API response to see what fields are available
      console.log('Raw user API response:', response);
      
      // Map API response to UserOption format
      // Print a sample profile to debug
      if (response.profiles && response.profiles.length > 0) {
        console.log('Sample profile structure:', JSON.stringify(response.profiles[0], null, 2));
      }
      
      const userOptions: UserOption[] = (response.profiles || [])
        .filter((user: any) => user.is_active !== false)
        .filter((user: any) => {
          if (!searchTerm) return true;
          
          // Get user details from the new structure or fall back to old properties
          const firstName = user.user_details?.first_name || user.user__first_name || '';
          const lastName = user.user_details?.last_name || user.user__last_name || '';
          const email = user.user_details?.email || user.user__email || '';
          
          // Filter by name or email if search term is provided
          const fullName = `${firstName} ${lastName}`.toLowerCase();
          const lowerEmail = email.toLowerCase();
          const term = searchTerm.toLowerCase();
          
          return fullName.includes(term) || lowerEmail.includes(term);
        })
        .map((user: UserOption) => {
          // Get user details from the new structure or fall back to old properties
          const firstName = user.user_details?.first_name || user.user__first_name || '';
          const lastName = user.user_details?.last_name || user.user__last_name || '';
          
          // Log the raw user object to see all available fields
          console.log('Raw user object:', user);
          
          return {
            ...user,
            // id is already the profile id, which is what we need
            // Add backward compatibility properties
            user__first_name: user.user_details?.first_name || user.user__first_name || '',
            user__last_name: user.user_details?.last_name || user.user__last_name || '',
            user__email: user.user_details?.email || user.user__email || '',
            display_name: `${firstName} ${lastName}`.trim()
          };
        });
      
      return {
        options: userOptions,
        teams: response.teams || [],
        error: null
      };
    } else {
      console.error('Error in fetchUserOptions:', response.error);
      return {
        options: [],
        teams: [],
        error: response.error || 'Failed to fetch users'
      };
    }
  } catch (error) {
    console.error('Exception in fetchUserOptions:', error);
    return {
      options: [],
      teams: [],
      error: 'An error occurred while fetching users'
    };
  }
};
