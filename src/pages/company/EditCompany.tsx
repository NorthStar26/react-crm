import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  TextField,
  AccordionDetails,
  Accordion,
  AccordionSummary,
  Typography,
  Box,
  Divider,
  FormControl,
  Select,
  MenuItem,
  Avatar,
  FormHelperText,
  Button,
  Badge
} from '@mui/material';
import { CompaniesUrl } from '../../services/ApiUrls';
import { CustomAppBar } from '../../components/CustomAppBar';
import { fetchData } from '../../components/FetchData';
import { RequiredTextField } from '../../styles/CssStyled';
import '../../styles/style.css';
import { FiChevronDown } from '@react-icons/all-files/fi/FiChevronDown';
import { FiChevronUp } from '@react-icons/all-files/fi/FiChevronUp';
import COUNTRIES from '../../data/countries';
import INDCHOICES from '../../data/INDCHOICES';
import { SuccessAlert, ErrorAlert } from '../../components/Button/SuccessAlert';
import { Spinner } from '../../components/Spinner';
import { DialogModal } from '../../components/DialogModal';
import { uploadImageToCloudinary } from '../../utils/uploadImageToCloudinary'; // Make sure you have this utility
import GreenCameraIcon from './GreenCameraIcon';


type FormErrors = {
  name?: string[];
  email?: string[];
  phone?: string[];
  website?: string[];
  industry?: string[];
  billing_street?: string[];
  billing_address_number?: string[];
  billing_city?: string[];
  billing_state?: string[];
  billing_postcode?: string[];
  billing_country?: string[];
  non_field_errors?: string[];
  detail?: string[];
};

interface FormData {
  name: string;
  email: string;
  phone: string;
  website: string;
  industry: string;
  billing_street: string;
  billing_address_number: string;
  billing_city: string;
  billing_state: string;
  billing_postcode: string;
  billing_country: string;
  logo?: File | null;
  logo_url?: string;
}

const CompanyLogo = ({ logoUrl, initial }: { logoUrl?: string; initial: string }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
      {logoUrl ? (
        <Avatar
          src={logoUrl}
          alt="Company Logo"
          sx={{ width: 100, height: 100 }}
        />
      ) : (
        <Avatar
          sx={{
            width: 100,
            height: 100,
            backgroundColor: '#284871',
            fontSize: 40,
          }}
        >
          {initial || 'C'}
        </Avatar>
      )}
    </div>
  );
};


function EditCompany() {
  console.log('Rendering EditCompany component');
  const { companyId } = useParams<{ companyId: string }>();
  console.log('CompanyId from params:', companyId);

  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Select states
  const [industrySelectOpen, setIndustrySelectOpen] = useState(false);
  const [countrySelectOpen, setCountrySelectOpen] = useState(false);

  // Form data with default values
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    website: '',
    industry: '',
    billing_street: '',
    billing_address_number: '',
    billing_city: '',
    billing_state: '',
    billing_postcode: '',
    billing_country: '',
    logo: null,
  });

  const [originalFormData, setOriginalFormData] = useState<FormData | null>(
    null
  );
  const [errors, setErrors] = useState<FormErrors>({});

  // Fetch company data on component mount
  useEffect(() => {
    console.log('useEffect triggered with companyId:', companyId);
    if (companyId) {
      getEditDetail(companyId);
    } else {
      setError('Company ID is missing');
      setLoading(false);
    }
  }, [companyId]);

  const getEditDetail = (id: string) => {
    console.log('Getting company details for ID:', id);

    const token = localStorage.getItem('Token');
    const cleanToken = token ? token.replace(/^Bearer\s+/, '') : '';

    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: cleanToken ? `Bearer ${cleanToken}` : '',
      org: localStorage.getItem('org') || '',
    };

    if (!headers.Authorization || !headers.org) {
      setError('Authentication required. Please login again.');
      setLoading(false);
      return;
    }

    const url = `${CompaniesUrl}${id}/`;
    console.log('Requesting URL:', url);

    fetchData(url, 'GET', null as any, headers)
      .then((res: any) => {
        console.log('Company data response:', res);

        if (!res.error) {
          // Extract company data
          const companyData = res.data || res;
          console.log('Setting form data with:', companyData);

          const loadedData = {
            name: companyData.name || '',
            email: companyData.email || '',
            phone: companyData.phone || '',
            website: companyData.website || '',
            industry: companyData.industry || 'TECHNOLOGY',
            billing_street: companyData.billing_street || '',
            billing_address_number: companyData.billing_address_number || '',
            billing_city: companyData.billing_city || '',
            billing_state: companyData.billing_state || '',
            billing_postcode: companyData.billing_postcode || '',
            billing_country: companyData.billing_country || '',
            logo: null,
            logo_url: companyData.logo_url || '',
          };

          setFormData(loadedData);
          // Store original data for comparison
          setOriginalFormData({ ...loadedData });
        } else {
          console.error('Error in API response:', res.error);
          setError('Failed to load company data. Please try again.');
        }
      })
      .catch((err) => {
        console.error('Error fetching company data:', err);
        setError(
          'An error occurred while loading the company. Please try again.'
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Function to extract the clear text of the error
  const extractErrorMessage = (error: any): string => {
    if (typeof error === 'string') {
      return error;
    }

    if (error && typeof error === 'object') {
      // Django ErrorDetail объект
      if (error.string) {
        return error.string;
      }
      if (error.message) {
        return error.message;
      }
      if (error.toString && typeof error.toString === 'function') {
        const str = error.toString();
        // Убираем префикс "ErrorDetail(string='" и суффикс "', code='...')"
        const match = str.match(/ErrorDetail\(string='([^']+)'/);
        if (match) {
          return match[1];
        }
        return str;
      }
    }

    return String(error);
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear errors when changing a field
    if (errors[name as keyof FormErrors]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  // Check if form data has been modified from the original
  const hasChanges = () => {
    if (!originalFormData) return false;

    return (
      formData.name !== originalFormData.name ||
      formData.email !== originalFormData.email ||
      formData.phone !== originalFormData.phone ||
      formData.website !== originalFormData.website ||
      formData.industry !== originalFormData.industry ||
      formData.billing_street !== originalFormData.billing_street ||
      formData.billing_address_number !==
      originalFormData.billing_address_number ||
      formData.billing_city !== originalFormData.billing_city ||
      formData.billing_state !== originalFormData.billing_state ||
      formData.billing_postcode !== originalFormData.billing_postcode ||
      formData.billing_country !== originalFormData.billing_country ||
      !!formData.logo_url
    );
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if anything has changed
    if (!hasChanges()) {
      navigate('/app/companies');
      return;
    }

    setUpdateLoading(true);
    setError(null);
    setErrors({});

    try {
      const token = localStorage.getItem('Token');
      const org = localStorage.getItem('org');

      const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: token
          ? `Bearer ${token.replace(/^Bearer\s+/i, '')}`
          : '',
        org: org || '',
      };

      if (!headers.Authorization || !headers.org) {
        setError('Missing authentication tokens');
        setUpdateLoading(false);
        return;
      }
      const uploadLogo = async () => {
        if (!formData.logo || !companyId) return;

        // 1. Upload the file to Cloudinary
        const result = await uploadImageToCloudinary(formData.logo);
        if (!result.success) {
          setError('Failed to upload logo');
          return;
        }

        // 2. Send PATCH request to backend with the Cloudinary URL
        const token = localStorage.getItem('Token');
        const org = localStorage.getItem('org');

        try {
          await fetchData(
            `${CompaniesUrl}${companyId}/`,
            'PATCH',
            JSON.stringify({ logo_url: result.url }),
            {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              Authorization: token ? `Bearer ${token.replace(/^Bearer\s+/i, '')}` : '',
              org: org || '',
            }
          );
          // Optionally update the preview with the new logo URL
          setFormData((prev) => ({
            ...prev,
            logo: null,
            logo_url: result.url,
          }));
          console.log('Logo uploaded and backend updated!');
        } catch (err: any) {
          console.error('Error uploading logo:', err);
          setError('Failed to update logo in backend');
        }
      };

      // Collect only changed fields for PATCH request
      const changedFields: Record<string, any> = {};

      if (!originalFormData) {
        setError('Cannot determine changed fields. Original data is missing.');
        setUpdateLoading(false);
        return;
      }

      if (formData.name !== originalFormData.name)
        changedFields.name = formData.name;
      if (formData.email !== originalFormData.email)
        changedFields.email = formData.email;
      if (formData.phone !== originalFormData.phone)
        changedFields.phone = formData.phone;
      if (formData.website !== originalFormData.website)
        changedFields.website = formData.website;
      if (formData.industry !== originalFormData.industry)
        changedFields.industry = formData.industry;
      if (formData.billing_street !== originalFormData.billing_street)
        changedFields.billing_street = formData.billing_street;
      if (
        formData.billing_address_number !==
        originalFormData.billing_address_number
      )
        changedFields.billing_address_number = formData.billing_address_number;
      if (formData.billing_city !== originalFormData.billing_city)
        changedFields.billing_city = formData.billing_city;
      if (formData.billing_state !== originalFormData.billing_state)
        changedFields.billing_state = formData.billing_state;
      if (formData.billing_postcode !== originalFormData.billing_postcode)
        changedFields.billing_postcode = formData.billing_postcode;
      if (formData.billing_country !== originalFormData.billing_country)
        changedFields.billing_country = formData.billing_country;

      console.log('Updating company data with PATCH:', changedFields);

      // Use PATCH method to update only the changed fields
      const url = `${CompaniesUrl}${companyId}/`;
      console.log('Update URL:', url);

      const res = await fetchData(
        url,
        'PATCH',
        JSON.stringify(changedFields),
        headers
      );

      console.log('API Response:', res);

      if (res.success || !res.error) {
        // ✅ Upload the logo (if selected) AFTER successful PATCH
        await uploadLogo();

        setShowSuccessAlert(true);

        // Navigate back to companies list after a short delay
        setTimeout(() => {
          navigate('/app/companies');
        }, 2000);
      } else {
        handleApiErrors(res);
      }

    } catch (err: any) {
      console.error('API Error:', err);
      handleApiErrors(err);
    } finally {
      setUpdateLoading(false);
    }
  };

  // Handle API errors
  const handleApiErrors = (error: any) => {
    if (error.details && typeof error.details === 'object') {
      console.log('Field errors received:', error.details);
      const newErrors: FormErrors = {};

      Object.keys(error.details).forEach((field) => {
        const fieldErrors = error.details[field];
        console.log(`Error for field ${field}:`, fieldErrors);

        if (Array.isArray(fieldErrors)) {
          newErrors[field as keyof FormErrors] =
            fieldErrors.map(extractErrorMessage);
        } else {
          newErrors[field as keyof FormErrors] = [
            extractErrorMessage(fieldErrors),
          ];
        }
      });

      setErrors(newErrors);
    } else if (typeof error.message === 'string') {
      setError(error.message);
    } else {
      setError('Failed to update company. Please try again.');
    }
  };

  const handleCloseSuccessAlert = () => {
    setShowSuccessAlert(false);
  };

  // Updated onCancel function with change check
  const onCancel = () => {
    if (hasChanges()) {
      setShowCancelDialog(true); // Show dialog if there are changes
    } else {
      navigate('/app/companies'); // If there are no changes, we move on immediately
    }
  };

  const handleCloseDialog = () => {
    setShowCancelDialog(false);
  };

  const handleConfirmCancel = () => {
    setShowCancelDialog(false);
    navigate('/app/companies');
  };

  const module = 'Companies';
  const crntPage = 'Update Company';

  const fieldStyles = {
    fieldContainer: {
      display: 'flex',
      justifyContent: 'flex-start', // Changed from 'center' to match AddCompany
      gap: '150px', // Changed from '100px' to match AddCompany
      alignItems: 'flex-start',
      width: '100%',
      marginBottom: '20px',
    },
    fieldSubContainer: {
      width: '40%',
      display: 'flex',
      flexDirection: 'column' as const,
    },
    fieldRow: {
      display: 'flex',
      flexDirection: 'row' as const,
      alignItems: 'center',
      marginBottom: '15px',
    },
    fieldTitle: {
      width: '130px',
      marginRight: '15px',
      marginBottom: 0,
      textAlign: 'right' as const,
    },
    fieldInput: {
      flex: 1,
    },
    textField: {
      width: '100%',
    },
  };

  // Debug rendering
  if (!companyId) {
    return (
      <Box sx={{ mt: '120px', p: 3, color: 'error.main' }}>
        <Typography variant="h5">Error: Missing company ID</Typography>
        <Button variant="contained" onClick={() => navigate('/app/companies')}>
          Back to Companies
        </Button>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ mt: '120px', display: 'flex', justifyContent: 'center' }}>
        <Spinner />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: '20px' }}>
      <CustomAppBar
        module={module}
        crntPage={crntPage}
        onCancel={onCancel}
        onSubmit={handleSubmit}
        variant="form"
        disabled={updateLoading || !hasChanges()}
      />

      <Box sx={{ mt: '120px' }}>
        {' '}
        {/*  mt: '20px' на mt: '120px' */}
        <form onSubmit={handleSubmit}>
          <div style={{ padding: '10px' }}>
            {/* Show general error */}
            <ErrorAlert
              open={!!error}
              message={error || ''}
              onClose={() => setError(null)}
              showCloseButton={true}
              autoHideDuration={5000}
            />

            {/* Company Information */}
            <div className="leadContainer">
              <Accordion style={{ width: '98%' }} defaultExpanded>
                <AccordionSummary
                  expandIcon={<FiChevronDown style={{ fontSize: '25px' }} />}
                >
                  <Typography className="accordion-header">
                    Company Information
                  </Typography>
                </AccordionSummary>
                <Divider className="divider" />
                <AccordionDetails>
                  <Box
                    sx={{
                      width: '98%',
                      color: '#1A3353',
                      mb: 1,
                      '& .fieldContainer, & .fieldContainer2': {
                        paddingLeft: '1%',
                        paddingRight: '8%',
                      },
                    }}
                  >
                    {/* Company Logo */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'right',
                        }}
                        badgeContent={
                          <span
                            style={{
                              background: '#fff',
                              borderRadius: '50%',
                              boxShadow: '0 0 2px #ccc',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 32,
                              height: 32,
                              cursor: 'pointer',
                            }}
                            onClick={() => {
                              document.getElementById('logo-upload')?.click();
                            }}
                          >
                            <GreenCameraIcon />
                          </span>
                        }
                      >
                        <Avatar
                          src={formData.logo_url}
                          alt="Company Logo"
                          sx={{ width: 100, height: 100 }}
                          onClick={() => {
                            document.getElementById('logo-upload')?.click();
                          }}
                        >
                          {formData.name ? formData.name.charAt(0).toUpperCase() : 'C'}
                        </Avatar>
                      </Badge>
                      <input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 2 * 1024 * 1024) {
                            alert('Logo must be less than 2 MB');
                            return;
                          }
                          setFormData((prev) => ({
                            ...prev,
                            logo: file,
                            logo_url: URL.createObjectURL(file), // Just show preview
                          }));
                        }}
                      />
                    </div>



                    {/* Row 1 */}
                    <div style={fieldStyles.fieldContainer}>
                      <div style={fieldStyles.fieldSubContainer}>
                        <div style={fieldStyles.fieldRow}>
                          <div style={fieldStyles.fieldTitle}>Company Name</div>
                          <div style={fieldStyles.fieldInput}>
                            <RequiredTextField
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              size="small"
                              fullWidth
                              helperText={errors?.name?.[0] || ''}
                              error={!!errors?.name?.[0]}
                              required
                            />
                          </div>
                        </div>
                      </div>
                      <div style={fieldStyles.fieldSubContainer}>
                        <div style={fieldStyles.fieldRow}>
                          <div style={fieldStyles.fieldTitle}>Website</div>
                          <div style={fieldStyles.fieldInput}>
                            <TextField
                              name="website"
                              value={formData.website}
                              onChange={handleChange}
                              size="small"
                              fullWidth
                              placeholder="https://company.com"
                              helperText={errors?.website?.[0] || ''}
                              error={!!errors?.website?.[0]}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Row 2 */}
                    <div style={fieldStyles.fieldContainer}>
                      <div style={fieldStyles.fieldSubContainer}>
                        <div style={fieldStyles.fieldRow}>
                          <div style={fieldStyles.fieldTitle}>Email</div>
                          <div style={fieldStyles.fieldInput}>
                            <TextField
                              name="email"
                              type="email"
                              value={formData.email}
                              onChange={handleChange}
                              size="small"
                              fullWidth
                              helperText={errors?.email?.[0] || ''}
                              error={!!errors?.email?.[0]}
                            />
                          </div>
                        </div>
                      </div>
                      <div style={fieldStyles.fieldSubContainer}>
                        <div style={fieldStyles.fieldRow}>
                          <div style={fieldStyles.fieldTitle}>Phone</div>
                          <div style={fieldStyles.fieldInput}>
                            <TextField
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              size="small"
                              fullWidth
                              placeholder="+12345678900"
                              helperText={
                                errors?.phone?.[0]
                                  ? errors.phone[0]
                                  : 'International format: +1234567890'
                              }
                              error={!!errors?.phone?.[0]}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Row 3 */}
                    <div style={fieldStyles.fieldContainer}>
                      <div style={fieldStyles.fieldSubContainer}>
                        <div style={fieldStyles.fieldRow}>
                          <div style={fieldStyles.fieldTitle}>Industry</div>
                          <div style={fieldStyles.fieldInput}>
                            <FormControl fullWidth>
                              <Select
                                name="industry"
                                value={formData.industry}
                                onOpen={() => setIndustrySelectOpen(true)}
                                onClose={() => setIndustrySelectOpen(false)}
                                open={industrySelectOpen}

                       IconComponent={() => (
                                                       <div className="select-icon-background">
                                                         {industrySelectOpen ? (
                                                           <FiChevronUp
                                                             className="select-icon"
                                                             onMouseDown={(e) => {
                                                               e.stopPropagation();
                                                               setIndustrySelectOpen(false);
                                                             }}
                                                           />
                                                         ) : (
                                                           <FiChevronDown
                                                             className="select-icon"
                                                             onMouseDown={(e) => {
                                                               e.stopPropagation();
                                                               setIndustrySelectOpen(true);
                                                             }}
                                                           />
                                                         )}
                                                        </div>
                                                     )}


                                // IconComponent={() => (
                                //   <div className="select-icon-background">
                                //     {industrySelectOpen ? (
                                //       <FiChevronUp className="select-icon" />
                                //     ) : (
                                //       <FiChevronDown className="select-icon" />
                                //     )}
                                //   </div>
                                // )}
                                className={'select'}
                                onChange={handleChange}
                                error={!!errors?.industry?.[0]}
                              >
                                {INDCHOICES.map(([code, name]) => (
                                  <MenuItem key={code} value={code}>
                                    {name}
                                  </MenuItem>
                                ))}
                              </Select>
                              <FormHelperText error={!!errors?.industry?.[0]}>
                                {errors?.industry?.[0] || ''}
                              </FormHelperText>
                            </FormControl>
                          </div>
                        </div>
                      </div>
                      <div style={fieldStyles.fieldSubContainer}>
                        <div style={fieldStyles.fieldRow}>
                          <div style={fieldStyles.fieldTitle}>Tags:</div>
                          <div style={fieldStyles.fieldInput}>
                            <TextField
                              name="tags"
                              value=""
                              size="small"
                              fullWidth
                              placeholder="Tags (Coming Soon)"
                              disabled={true}
                              helperText="Tag functionality will be available soon"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </div>

            {/* Address Information */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                marginTop: '20px',
              }}
            >
              <Accordion defaultExpanded style={{ width: '98%' }}>
                <AccordionSummary
                  expandIcon={<FiChevronDown style={{ fontSize: '25px' }} />}
                >
                  <Typography className="accordion-header">Address</Typography>
                </AccordionSummary>
                <Divider className="divider" />
                <AccordionDetails>
                  <Box
                    sx={{
                      width: '98%',
                      color: '#1A3353',
                      mb: 1,
                      '& .fieldContainer, & .fieldContainer2': {
                        paddingLeft: '1%',
                        paddingRight: '8%',
                      },
                    }}
                  >
                    {/* Row 1 */}
                    <div style={fieldStyles.fieldContainer}>
                      <div style={fieldStyles.fieldSubContainer}>
                        <div style={fieldStyles.fieldRow}>
                          <div style={fieldStyles.fieldTitle}>
                            Address Number
                          </div>
                          <div style={fieldStyles.fieldInput}>
                            <TextField
                              name="billing_address_number"
                              value={formData.billing_address_number}
                              onChange={handleChange}
                              size="small"
                              fullWidth
                              helperText={
                                errors?.billing_address_number?.[0] || ''
                              }
                              error={!!errors?.billing_address_number?.[0]}
                            />
                          </div>
                        </div>
                      </div>
                      <div style={fieldStyles.fieldSubContainer}>
                        <div style={fieldStyles.fieldRow}>
                          <div style={fieldStyles.fieldTitle}>City</div>
                          <div style={fieldStyles.fieldInput}>
                            <TextField
                              name="billing_city"
                              value={formData.billing_city}
                              onChange={handleChange}
                              size="small"
                              fullWidth
                              helperText={errors?.billing_city?.[0] || ''}
                              error={!!errors?.billing_city?.[0]}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Row 2 */}
                    <div style={fieldStyles.fieldContainer}>
                      <div style={fieldStyles.fieldSubContainer}>
                        <div style={fieldStyles.fieldRow}>
                          <div style={fieldStyles.fieldTitle}>Street</div>
                          <div style={fieldStyles.fieldInput}>
                            <TextField
                              name="billing_street"
                              value={formData.billing_street}
                              onChange={handleChange}
                              size="small"
                              fullWidth
                              helperText={errors?.billing_street?.[0] || ''}
                              error={!!errors?.billing_street?.[0]}
                            />
                          </div>
                        </div>
                      </div>
                      <div style={fieldStyles.fieldSubContainer}>
                        <div style={fieldStyles.fieldRow}>
                          <div style={fieldStyles.fieldTitle}>State</div>
                          <div style={fieldStyles.fieldInput}>
                            <TextField
                              name="billing_state"
                              value={formData.billing_state}
                              onChange={handleChange}
                              size="small"
                              fullWidth
                              helperText={errors?.billing_state?.[0] || ''}
                              error={!!errors?.billing_state?.[0]}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Row 3 */}
                    <div style={fieldStyles.fieldContainer}>
                      <div style={fieldStyles.fieldSubContainer}>
                        <div style={fieldStyles.fieldRow}>
                          <div style={fieldStyles.fieldTitle}>Postcode</div>
                          <div style={fieldStyles.fieldInput}>
                            <TextField
                              name="billing_postcode"
                              value={formData.billing_postcode}
                              onChange={handleChange}
                              size="small"
                              fullWidth
                              helperText={errors?.billing_postcode?.[0] || ''}
                              error={!!errors?.billing_postcode?.[0]}
                            />
                          </div>
                        </div>
                      </div>
                      <div style={fieldStyles.fieldSubContainer}>
                        <div style={fieldStyles.fieldRow}>
                          <div style={fieldStyles.fieldTitle}>Country</div>
                          <div style={fieldStyles.fieldInput}>
                            <FormControl fullWidth>
                              <Select
                                name="billing_country"
                                value={formData.billing_country}
                                onOpen={() => setCountrySelectOpen(true)}
                                onClose={() => setCountrySelectOpen(false)}
                                open={countrySelectOpen}
                                IconComponent={() => (
                                  <div className="select-icon-background">
                                    {countrySelectOpen ? (
                                      <FiChevronUp className="select-icon" />
                                    ) : (
                                      <FiChevronDown className="select-icon" />
                                    )}
                                  </div>
                                )}
                                className={'select'}
                                onChange={handleChange}
                                error={!!errors?.billing_country?.[0]}
                              >
                                {COUNTRIES.map(([code, name]) => (
                                  <MenuItem key={code} value={code}>
                                    {name}
                                  </MenuItem>
                                ))}
                              </Select>
                              <FormHelperText
                                error={!!errors?.billing_country?.[0]}
                              >
                                {errors?.billing_country?.[0] || ''}
                              </FormHelperText>
                            </FormControl>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </div>
          </div>
        </form>
      </Box>

      {/* Success Alert */}
      <SuccessAlert
        open={showSuccessAlert}
        message="Company updated successfully"
        onClose={handleCloseSuccessAlert}
        type="success"
      />

      {/* Cancel Confirmation Dialog */}
      <DialogModal
        isDelete={showCancelDialog}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmCancel}
        modalDialog="Are you sure you want to cancel? All unsaved changes will be lost."
        confirmText="Yes, Cancel"
        cancelText="Continue Editing"
      />
    </Box>
  );
}

export default EditCompany;
