import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  FormHelperText,
  Switch,
  FormControlLabel,
  Button,
} from '@mui/material';
import { useQuill } from 'react-quilljs';
import 'quill/dist/quill.snow.css';
import { ContactUrl, CompaniesUrl } from '../../services/ApiUrls';
import { CustomAppBar } from '../../components/CustomAppBar';
import { fetchData } from '../../components/FetchData';
import { RequiredTextField } from '../../styles/CssStyled';
import '../../styles/style.css';
import { FiChevronDown } from '@react-icons/all-files/fi/FiChevronDown';
import { FiChevronUp } from '@react-icons/all-files/fi/FiChevronUp';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { SuccessAlert, ErrorAlert } from '../../components/Button/SuccessAlert';
import { Spinner } from '../../components/Spinner';
import { DialogModal } from '../../components/DialogModal';
import { COUNTRIES } from '../../data/countries';
import LANGUAGE_CHOICES from '../../data/LANGUAGE';

type FormErrors = {
  salutation?: string[];
  first_name?: string[];
  last_name?: string[];
  primary_email?: string[];
  mobile_number?: string[];
  company?: string[];
  title?: string[];
  country?: string[];
  language?: string[];
  description?: string[];
  non_field_errors?: string[];
  detail?: string[];
  department?: string[];
};

interface FormData {
  salutation: string;
  first_name: string;
  last_name: string;
  primary_email: string;
  mobile_number: string;
  company: string;
  title: string;
  country: string;
  language: string;
  description: string;
  do_not_call: boolean;
  department?: string;
}

const SALUTATIONS = [
  { value: 'Mr', label: 'Mr' },
  { value: 'Ms', label: 'Ms' },
];

function AddContact() {
  const navigate = useNavigate();
  const location = useLocation();
  const { quill, quillRef } = useQuill();
  const initialContentRef = useRef(null);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);

  // Select states
  const [salutationSelectOpen, setSalutationSelectOpen] = useState(false);
  const [companySelectOpen, setCompanySelectOpen] = useState(false);
  const [countrySelectOpen, setCountrySelectOpen] = useState(false);
  const [languageSelectOpen, setLanguageSelectOpen] = useState(false);

  // Form data with default values
  const [formData, setFormData] = useState<FormData>({
    salutation: '',
    first_name: '',
    last_name: '',
    primary_email: '',
    mobile_number: '',
    company: '',
    title: '',
    country: 'GB', // Default to United Kingdom
    language: '',
    description: '',
    do_not_call: false,
    department: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    // Load companies list
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (quill && quillRef?.current?.firstChild) {
      // Save the initial state (HTML content) of the Quill editor
      initialContentRef.current = quillRef.current.firstChild.innerHTML;
    }
  }, [quill]);

  const fetchCompanies = async () => {
    const token = localStorage.getItem('Token');
    const cleanToken = token ? token.replace(/^Bearer\s+/, '') : '';

    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: cleanToken ? `Bearer ${cleanToken}` : '',
      org: localStorage.getItem('org') || '',
    };

    try {
      console.log('Fetching companies with headers:', headers);
      const response = await fetchData(
        CompaniesUrl,
        'GET',
        null as any,
        headers
      );

      console.log('Companies response:', response);

      if (!response.error) {
        // Check different possible response structures
        const companiesList =
          response.data || response.company_obj_list || response.results || [];
        setCompanies(companiesList);
        console.log('Companies loaded:', companiesList);
      } else {
        console.error('Error loading companies:', response.error);
      }
    } catch (err) {
      console.error('Error fetching companies:', err);
    }
  };

  const extractErrorMessage = (error: any): string => {
    if (typeof error === 'string') {
      return error;
    }

    if (error && typeof error === 'object') {
      if (error.string) {
        return error.string;
      }
      if (error.message) {
        return error.message;
      }
      if (error.toString && typeof error.toString === 'function') {
        const str = error.toString();
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
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });

    if (errors[name as keyof FormErrors]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  const resetQuillToInitialState = () => {
    // Reset the Quill editor to its initial state
    setFormData({ ...formData, description: '' });
    if (quill && initialContentRef.current !== null) {
      quill.clipboard.dangerouslyPasteHTML(initialContentRef.current);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
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
        setLoading(false);
        return;
      }

      // Get description from Quill editor if available
      const descriptionContent =
        quill && quill.root ? quill.root.innerHTML : formData.description;

      // Prepare data for submission
      const data = {
        salutation: formData.salutation || null,
        first_name: formData.first_name,
        last_name: formData.last_name,
        primary_email: formData.primary_email || null,
        mobile_number: formData.mobile_number || null,
        company: formData.company || null,
        title: formData.title || null,
        country: formData.country || null,
        language: formData.language || null,
        description: descriptionContent || null,
        do_not_call: formData.do_not_call,
        department: formData.department || null,
      };
      console.log('Submitting contact data:', data);

      const res = await fetchData(
        `${ContactUrl}/`,
        'POST',
        JSON.stringify(data),
        headers
      );

      console.log('API Response:', res);

      if (res.success || !res.error) {
        setShowSuccessAlert(true);
        setTimeout(() => {
          navigate('/app/contacts');
        }, 2000);
      } else {
        // Handle field validation errors
        if (res.details && typeof res.details === 'object') {
          console.log('Field errors received:', res.details);
          const newErrors: FormErrors = {};

          Object.keys(res.details).forEach((field) => {
            const fieldErrors = res.details[field];
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
        } else if (typeof res.message === 'string') {
          setError(res.message);
        } else {
          setError('Failed to create contact. Please try again.');
        }
      }
    } catch (err: any) {
      console.error('API Error:', err);

      if (
        err.message &&
        err.message.includes('An unexpected error occurred:')
      ) {
        try {
          const jsonMatch = err.message.match(
            /An unexpected error occurred: ({.*})/
          );
          if (jsonMatch) {
            const errorData = JSON.parse(jsonMatch[1].replace(/'/g, '"'));
            console.log('Parsed error data:', errorData);

            const newErrors: FormErrors = {};

            Object.keys(errorData).forEach((field) => {
              const fieldErrors = errorData[field];
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
            return;
          }
        } catch (parseError) {
          console.error('Error parsing error message:', parseError);
        }
      }

      if (err.data?.details && typeof err.data.details === 'object') {
        console.log('Field errors received:', err.data.details);
        const newErrors: FormErrors = {};

        Object.keys(err.data.details).forEach((field) => {
          const fieldErrors = err.data.details[field];

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
      } else if (err.data?.message) {
        setError(err.data.message);
      } else if (err.responseText) {
        try {
          const parsedError = JSON.parse(err.responseText);

          if (parsedError.details && typeof parsedError.details === 'object') {
            const newErrors: FormErrors = {};

            Object.keys(parsedError.details).forEach((field) => {
              const fieldErrors = parsedError.details[field];

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
          } else if (parsedError.message) {
            setError(parsedError.message);
          } else {
            setError('Failed to create contact. Please try again.');
          }
        } catch (parseErr) {
          console.error('Error parsing response:', parseErr);
          setError('Failed to create contact. Please try again.');
        }
      } else {
        setError(err?.message || 'Failed to create contact. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApiErrors = (error: any) => {
    console.log('Full error object:', error);

    if (error && error.error && typeof error.error === 'object') {
      const errorObj = error.error;
      const newErrors: FormErrors = {};

      Object.keys(errorObj).forEach((field) => {
        if (field !== 'non_field_errors' && field !== 'detail') {
          if (Array.isArray(errorObj[field])) {
            newErrors[field as keyof FormErrors] =
              errorObj[field].map(extractErrorMessage);
          } else {
            newErrors[field as keyof FormErrors] = [
              extractErrorMessage(errorObj[field]),
            ];
          }
        }
      });

      if (errorObj.non_field_errors) {
        if (Array.isArray(errorObj.non_field_errors)) {
          setError(
            errorObj.non_field_errors.map(extractErrorMessage).join(', ')
          );
        } else {
          setError(extractErrorMessage(errorObj.non_field_errors));
        }
      } else if (errorObj.detail) {
        setError(extractErrorMessage(errorObj.detail));
      } else if (Object.keys(newErrors).length === 0) {
        setError('Validation error. Please check your input.');
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
      }
    } else if (error && error.message) {
      setError(error.message);
    } else {
      setError('Failed to create contact. Please try again.');
    }
  };

  const handleCloseSuccessAlert = () => {
    setShowSuccessAlert(false);
  };

  const isFormDirty = () => {
    return !!(
      formData.first_name ||
      formData.last_name ||
      formData.primary_email ||
      formData.mobile_number ||
      formData.company ||
      formData.title ||
      formData.description
    );
  };

  const onCancel = () => {
    if (isFormDirty()) {
      setShowCancelDialog(true);
    } else {
      navigate('/app/contacts');
    }
  };

  const handleCloseDialog = () => {
    setShowCancelDialog(false);
  };

  const handleConfirmCancel = () => {
    setShowCancelDialog(false);
    navigate('/app/contacts');
  };

  const module = 'Contacts';
  const crntPage = 'Add Contact';

  const fieldStyles = {
    fieldContainer: {
      display: 'flex',
      justifyContent: 'flex-start',
      gap: '150px',
      alignItems: 'flex-start',
      width: '100%',
      marginBottom: '10px', //  spacing between rows
    },
    fieldSubContainer: {
      width: '40%',
      display: 'flex',
      flexDirection: 'column' as const,
    },
    fieldRow: {
      display: 'flex',
      flexDirection: 'row' as const,
      alignItems: 'flex-start',
      minHeight: '56px',
      marginBottom: '0px', //  initial margin bottom
    },
    fieldTitle: {
      width: '130px',
      marginRight: '15px',
      marginBottom: 0,
      textAlign: 'right' as const,
      paddingTop: '8px',
    },
    fieldInput: {
      flex: 1,
    },
  };

  return (
    <Box sx={{ mt: '60px' }}>
      <CustomAppBar
        module={module}
        crntPage={crntPage}
        onCancel={onCancel}
        onSubmit={handleSubmit}
        variant="form"
      />
      <Box sx={{ mt: '120px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ padding: '10px' }}>
            <ErrorAlert
              open={!!error}
              message={error || ''}
              onClose={() => setError(null)}
              showCloseButton={true}
              autoHideDuration={5000}
            />

            {/* Contact Information */}
            <div className="leadContainer">
              <Accordion style={{ width: '98%' }} defaultExpanded>
                <AccordionSummary
                  expandIcon={<FiChevronDown style={{ fontSize: '25px' }} />}
                >
                  <Typography className="accordion-header">
                    Contact Information
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
                    {/* Row 1 */}
                    <div style={fieldStyles.fieldContainer}>
                      <div style={fieldStyles.fieldSubContainer}>
                        <div style={fieldStyles.fieldRow}>
                          <div style={fieldStyles.fieldTitle}>Salutation</div>
                          <div style={fieldStyles.fieldInput}>
                            <FormControl fullWidth>
                              <Select
                                name="salutation"
                                value={formData.salutation}
                                onOpen={() => setSalutationSelectOpen(true)}
                                onClose={() => setSalutationSelectOpen(false)}
                                open={salutationSelectOpen}
                                IconComponent={() => (
                                  <div className="select-icon-background">
                                    {salutationSelectOpen ? (
                                      <FiChevronUp
                                        className="select-icon"
                                        onMouseDown={(e) => {
                                          e.stopPropagation();
                                          setSalutationSelectOpen(false);
                                        }}
                                      />
                                    ) : (
                                      <FiChevronDown
                                        className="select-icon"
                                        onMouseDown={(e) => {
                                          e.stopPropagation();
                                          setSalutationSelectOpen(true);
                                        }}
                                      />
                                    )}
                                  </div>
                                )}
                                // IconComponent={() => (
                                //   <div className="select-icon-background">
                                //     {salutationSelectOpen ? (
                                //       <FiChevronUp className="select-icon" />
                                //     ) : (
                                //       <FiChevronDown className="select-icon" />
                                //     )}
                                //   </div>
                                // )}
                                className={'select'}
                                onChange={handleChange}
                                error={!!errors?.salutation?.[0]}
                              >
                                <MenuItem value="">
                                  <em>None</em>
                                </MenuItem>
                                {SALUTATIONS.map((sal) => (
                                  <MenuItem key={sal.value} value={sal.value}>
                                    {sal.label}
                                  </MenuItem>
                                ))}
                              </Select>
                              <FormHelperText error={!!errors?.salutation?.[0]}>
                                {errors?.salutation?.[0] || ' '}
                              </FormHelperText>
                            </FormControl>
                          </div>
                        </div>
                      </div>
                      <div style={fieldStyles.fieldSubContainer}>
                        <div style={fieldStyles.fieldRow}>
                          <div style={fieldStyles.fieldTitle}>
                            First Name <span style={{ color: 'red' }}>*</span>
                          </div>
                          <div style={fieldStyles.fieldInput}>
                            <RequiredTextField
                              name="first_name"
                              value={formData.first_name}
                              onChange={handleChange}
                              size="small"
                              fullWidth
                              helperText={errors?.first_name?.[0] || ' '}
                              error={!!errors?.first_name?.[0]}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Row 2 */}
                    <div style={fieldStyles.fieldContainer}>
                      <div style={fieldStyles.fieldSubContainer}>
                        <div style={fieldStyles.fieldRow}>
                          <div style={fieldStyles.fieldTitle}>
                            Last Name <span style={{ color: 'red' }}>*</span>
                          </div>
                          <div style={fieldStyles.fieldInput}>
                            <RequiredTextField
                              name="last_name"
                              value={formData.last_name}
                              onChange={handleChange}
                              size="small"
                              fullWidth
                              helperText={errors?.last_name?.[0] || ' '}
                              error={!!errors?.last_name?.[0]}
                              required
                            />
                          </div>
                        </div>
                      </div>
                      <div style={fieldStyles.fieldSubContainer}>
                        <div style={fieldStyles.fieldRow}>
                          <div style={fieldStyles.fieldTitle}>
                            Email <span style={{ color: 'red' }}>*</span>
                          </div>
                          <div style={fieldStyles.fieldInput}>
                            <TextField
                              name="primary_email"
                              type="email"
                              value={formData.primary_email}
                              onChange={handleChange}
                              size="small"
                              fullWidth
                              helperText={errors?.primary_email?.[0] || ' '}
                              error={!!errors?.primary_email?.[0]}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Row 3 - Company и Job Title */}
                    <div style={fieldStyles.fieldContainer}>
                      <div style={fieldStyles.fieldSubContainer}>
                        <div style={fieldStyles.fieldRow}>
                          <div style={fieldStyles.fieldTitle}>Company</div>
                          <div style={fieldStyles.fieldInput}>
                            <FormControl fullWidth>
                              <Select
                                name="company"
                                value={formData.company}
                                onOpen={() => setCompanySelectOpen(true)}
                                onClose={() => setCompanySelectOpen(false)}
                                open={companySelectOpen}
                                IconComponent={() => (
                                  <div className="select-icon-background">
                                    {salutationSelectOpen ? (
                                      <FiChevronUp
                                        className="select-icon"
                                        onMouseDown={(e) => {
                                          e.stopPropagation();
                                          setCompanySelectOpen(false);
                                        }}
                                      />
                                    ) : (
                                      <FiChevronDown
                                        className="select-icon"
                                        onMouseDown={(e) => {
                                          e.stopPropagation();
                                          setCompanySelectOpen(true);
                                        }}
                                      />
                                    )}
                                  </div>
                                )}
                                // IconComponent={() => (
                                //   <div className="select-icon-background">
                                //     {companySelectOpen ? (
                                //       <FiChevronUp className="select-icon" />
                                //     ) : (
                                //       <FiChevronDown className="select-icon" />
                                //     )}
                                //   </div>
                                // )}

                                className={'select'}
                                onChange={handleChange}
                                error={!!errors?.company?.[0]}
                              >
                                <MenuItem value="">
                                  <em>None</em>
                                </MenuItem>
                                {companies.map((company: any) => (
                                  <MenuItem key={company.id} value={company.id}>
                                    {company.name}
                                  </MenuItem>
                                ))}
                              </Select>
                              <FormHelperText error={!!errors?.company?.[0]}>
                                {errors?.company?.[0] || ' '}
                              </FormHelperText>
                            </FormControl>
                          </div>
                        </div>
                      </div>
                      <div style={fieldStyles.fieldSubContainer}>
                        <div style={fieldStyles.fieldRow}>
                          <div style={fieldStyles.fieldTitle}>
                            Job Title <span style={{ color: 'red' }}>*</span>
                          </div>
                          <div style={fieldStyles.fieldInput}>
                            <TextField
                              name="title"
                              value={formData.title}
                              onChange={handleChange}
                              size="small"
                              fullWidth
                              helperText={errors?.title?.[0] || ' '}
                              error={!!errors?.title?.[0]}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Row 4 - Language и Department */}
                    <div style={fieldStyles.fieldContainer}>
                      <div style={fieldStyles.fieldSubContainer}>
                        <div style={fieldStyles.fieldRow}>
                          <div style={fieldStyles.fieldTitle}>Language</div>
                          <div style={fieldStyles.fieldInput}>
                            <FormControl fullWidth>
                              <Select
                                name="language"
                                value={formData.language}
                                onOpen={() => setLanguageSelectOpen(true)}
                                onClose={() => setLanguageSelectOpen(false)}
                                open={languageSelectOpen}
                                IconComponent={() => (
                                  <div className="select-icon-background">
                                    {languageSelectOpen ? (
                                      <FiChevronUp className="select-icon" />
                                    ) : (
                                      <FiChevronDown className="select-icon" />
                                    )}
                                  </div>
                                )}
                                className={'select'}
                                onChange={handleChange}
                                error={!!errors?.language?.[0]}
                                displayEmpty
                              >
                                <MenuItem value="">
                                  <em>None</em>
                                </MenuItem>
                                {LANGUAGE_CHOICES.map(([code, label]) => (
                                  <MenuItem key={code} value={code}>
                                    {label}
                                  </MenuItem>
                                ))}
                              </Select>
                              <FormHelperText error={!!errors?.language?.[0]}>
                                {errors?.language?.[0] || ' '}
                              </FormHelperText>
                            </FormControl>
                          </div>
                        </div>
                      </div>
                      <div style={fieldStyles.fieldSubContainer}>
                        <div style={fieldStyles.fieldRow}>
                          <div style={fieldStyles.fieldTitle}>Department</div>
                          <div style={fieldStyles.fieldInput}>
                            <TextField
                              name="department"
                              value={formData.department}
                              onChange={handleChange}
                              size="small"
                              fullWidth
                              placeholder="Enter department"
                              helperText={errors?.department?.[0] || ''}
                              error={!!errors?.department?.[0]}
                              InputProps={{
                                style: {
                                  color: '#0f0f0fff',
                                },
                              }}
                              sx={{
                                '& .MuiInputBase-input.Mui-disabled': {
                                  WebkitTextFillColor: '#9e9e9e',
                                  cursor: 'default',
                                },
                                '& .MuiOutlinedInput-root.Mui-disabled': {
                                  '& > fieldset': {
                                    borderColor: '#e0e0e0',
                                  },
                                },
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Row 5 - Phone Number и Do not Call */}
                    <div style={fieldStyles.fieldContainer}>
                      <div style={fieldStyles.fieldSubContainer}>
                        <div style={fieldStyles.fieldRow}>
                          <div style={fieldStyles.fieldTitle}>Phone Number</div>
                          <div style={fieldStyles.fieldInput}>
                            <TextField
                              name="mobile_number"
                              value={formData.mobile_number}
                              onChange={handleChange}
                              size="small"
                              fullWidth
                              placeholder="+12345678900"
                              helperText={
                                errors?.mobile_number?.[0]
                                  ? errors.mobile_number[0]
                                  : 'International format: +1234567890'
                              }
                              error={!!errors?.mobile_number?.[0]}
                            />
                          </div>
                        </div>
                      </div>
                      <div style={fieldStyles.fieldSubContainer}>
                        <div style={fieldStyles.fieldRow}>
                          <div style={fieldStyles.fieldTitle}>Do not Call</div>
                          <div style={fieldStyles.fieldInput}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={formData.do_not_call}
                                  onChange={handleChange}
                                  name="do_not_call"
                                  color="primary"
                                />
                              }
                              label=""
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </div>

            {/* Description details  */}
            <div className="leadContainer">
              <Accordion defaultExpanded style={{ width: '98%' }}>
                <AccordionSummary
                  expandIcon={<FiChevronDown style={{ fontSize: '25px' }} />}
                >
                  <Typography className="accordion-header">
                    Description
                  </Typography>
                </AccordionSummary>
                <Divider className="divider" />
                <AccordionDetails>
                  <Box
                    sx={{ width: '100%', color: '#1A3353', mb: 1 }}
                    component="form"
                    noValidate
                    autoComplete="off"
                  >
                    <div className="DescriptionDetail">
                      <div className="descriptionTitle">Description</div>
                      <div style={{ width: '100%', marginBottom: '3%' }}>
                        <div ref={quillRef} />
                      </div>
                    </div>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mt: 1.5,
                      }}
                    >
                      <Button
                        className="header-button"
                        onClick={resetQuillToInitialState}
                        size="small"
                        variant="contained"
                        startIcon={
                          <FaTimesCircle
                            style={{
                              fill: 'white',
                              width: '16px',
                              marginLeft: '2px',
                            }}
                          />
                        }
                        sx={{
                          backgroundColor: '#2b5075',
                          ':hover': { backgroundColor: '#1e3750' },
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="header-button"
                        onClick={() => {
                          if (quillRef?.current?.firstChild) {
                            setFormData({
                              ...formData,
                              description:
                                quillRef.current.firstChild.innerHTML,
                            });
                          }
                        }}
                        variant="contained"
                        size="small"
                        startIcon={
                          <FaCheckCircle
                            style={{
                              fill: 'white',
                              width: '16px',
                              marginLeft: '2px',
                            }}
                          />
                        }
                        sx={{ ml: 1 }}
                      >
                        Save
                      </Button>
                    </Box>
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
        message="Contact added successfully"
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

export default AddContact;
