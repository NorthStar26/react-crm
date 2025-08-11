import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { fetchData } from '../components/FetchData';

interface UserProfile {
  user_details: {
    email: string;
    profile_pic: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    id: string;
  };
  role: string;
  phone: string;
  alternate_phone: string;
  address: {
    address_line: string;
    street: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    number: string;
    country_display: string;
  };
  has_sales_access: boolean;
  has_marketing_access: boolean;
  is_organization_admin: boolean;
  org: {
    id: string;
    name: string;
  };
}

interface UserState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type UserAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: UserProfile }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_USER' }
  | { type: 'UPDATE_PROFILE'; payload: Partial<UserProfile> };

const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const userReducer = (state: UserState, action: UserAction): UserState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        isAuthenticated: false,
      };
    case 'CLEAR_USER':
      return {
        ...initialState,
        isLoading: false,
      };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    default:
      return state;
  }
};

interface UserContextType extends UserState {
  loadUserProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: 'sales' | 'marketing' | 'admin') => boolean;
  hasToken: () => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);

  const loadUserProfile = async () => {
    const token = localStorage.getItem('Token');
    const org = localStorage.getItem('org');

    if (!token) {
      dispatch({ type: 'CLEAR_USER' });
      return;
    }

    // If no org is selected, we still consider the user authenticated
    // but won't load profile data until org is selected
    if (!org) {
      dispatch({ type: 'SET_LOADING', payload: false });
      // Set a minimal authenticated state without full profile
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: token,
        org: org,
      };

      // Get user profile using the existing profile endpoint
      const response = await fetchData('profile/', 'GET', null as any, headers);
      
      if (!response.error && response.user_obj) {
        dispatch({ type: 'SET_USER', payload: response.user_obj });
        // Store user ID for future use
        localStorage.setItem('userId', response.user_obj.user_details.id);
      } else {
        throw new Error('Failed to load user profile');
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load user profile' });
      // If profile loading fails, clear localStorage to force re-login
      localStorage.removeItem('Token');
      localStorage.removeItem('org');
      localStorage.removeItem('userId');
    }
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    dispatch({ type: 'UPDATE_PROFILE', payload: updates });
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('Token');
    localStorage.removeItem('org');
    localStorage.removeItem('userId');
    localStorage.removeItem('res');
    localStorage.removeItem('refresh_token');
    
    // Clear context state
    dispatch({ type: 'CLEAR_USER' });
  };

  const hasRole = (role: string): boolean => {
    return state.user?.role === role;
  };

  const hasPermission = (permission: 'sales' | 'marketing' | 'admin'): boolean => {
    if (!state.user) return false;
    
    switch (permission) {
      case 'sales':
        return state.user.has_sales_access;
      case 'marketing':
        return state.user.has_marketing_access;
      case 'admin':
        return state.user.is_organization_admin;
      default:
        return false;
    }
  };

  const hasToken = (): boolean => {
    return !!localStorage.getItem('Token');
  };

  // Load user profile on mount and when org changes
  useEffect(() => {
    loadUserProfile();
  }, []);

  // Listen for organization changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'org' && e.newValue !== e.oldValue) {
        loadUserProfile();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const value: UserContextType = {
    ...state,
    loadUserProfile,
    updateProfile,
    logout,
    hasRole,
    hasPermission,
    hasToken,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
