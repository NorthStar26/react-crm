// Base URL without /api/
export const SERVER = process.env.REACT_APP_API_BASE_URL
  ? process.env.REACT_APP_API_BASE_URL.replace(/\/api\/$/, '')
  : 'http://localhost:8000';

// URL with /api/ for API requests
export const API_URL = `${SERVER}/api`;

// authurl
export const LoginUrl = 'auth/login';
export const RegisterUrl = 'auth/register';
export const ActivateAccountUrl = 'auth/set-password';
export const ForgotPasswordUrl = 'auth/forgot-password';
export const PasswordResetUrl = '/auth/password-reset';
export const PasswordResetConfirmUrl = '/auth/password-reset-confirm';

export const AuthUrl = 'auth/google';
// org
export const OrgUrl = 'org';
// export const OrgUrl = 'auth/create-org'
// company

export const CompanyUrl = 'leads/company';
export const CompaniesUrl = 'leads/companies';
// Lead
export const LeadUrl = 'leads';
// Contact
export const ContactUrl = 'contacts';
// Opportunity
export const OpportunityUrl = 'opportunities';
// ACCOUNTS
export const AccountsUrl = 'accounts';
// CASES
export const CasesUrl = 'cases';
// USERS
export const UsersUrl = 'users';
export const UserUrl = 'user';
// PROFILE
export const ProfileUrl = 'profile';
//
