import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  FormControl,
  TextareaAutosize,
  AccordionDetails,
  Accordion,
  AccordionSummary,
  Typography,
  Box,
  MenuItem,
  InputAdornment,
  Chip,
  Autocomplete,
  FormHelperText,
  IconButton,
  Tooltip,
  Divider,
  Select,
  Button,
  Avatar,
  Stack,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useQuill } from 'react-quilljs';
import 'quill/dist/quill.snow.css';
import '../../styles/style.css';
import { LeadUrl } from '../../services/ApiUrls';
import { fetchData, Header } from '../../components/FetchData';
import {
  fetchCompanyOptions,
  CompanyOption,
} from '../../services/companyService';
import {
  fetchContactOptions,
  ContactOption,
} from '../../services/contactService';
import { fetchUserOptions, UserOption } from '../../services/userService';
import { useDebounce } from '../../hooks/useDebounce';
import { CustomAppBar } from '../../components/CustomAppBar';
import {
  FaArrowDown,
  FaCheckCircle,
  FaFileUpload,
  FaPalette,
  FaPercent,
  FaPlus,
  FaTimes,
  FaTimesCircle,
  FaUpload,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFilePowerpoint,
  FaFileImage,
  FaFileArchive,
  FaFileAlt,
  FaFileCode,
  FaFile,
} from 'react-icons/fa';
import { useForm } from '../../components/UseForm';
import {
  CustomPopupIcon,
  CustomSelectField,
  RequiredTextField,
  StyledSelect,
} from '../../styles/CssStyled';
import { FiChevronDown } from '@react-icons/all-files/fi/FiChevronDown';
import { FiChevronUp } from '@react-icons/all-files/fi/FiChevronUp';
import {
  isFileTypeAllowed,
  uploadFileToCloudinary,
  attachFileToLead,
} from '../../utils/uploadFileToCloudinary';

// Define interfaces for mock data
interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface User {
  id: string;
  user__email: string;
  username: string;
}

// Mock data for dropdowns and selectors
const MOCK_CONTACTS: Contact[] = [];
// MOCK_USERS removed as we're now using real data from the API
const MOCK_TAGS: string[] = ['Important', 'Urgent', 'Follow-up', 'New'];
// MOCK_CONTACT_OPTIONS removed as we're now using real data from the API
// MOCK_COMPANIES removed as we're now using real data from the API
// Updated status options based on backend requirements
const MOCK_STATUS: [string, string][] = [
  ['new', 'New'],
  ['qualified', 'Qualified'],
  ['disqualified', 'Disqualified'],
  ['recycled', 'Recycled'],
];
const MOCK_SOURCES: [string, string][] = [
  ['call', 'Call'],
  ['email', 'Email'],
  ['existing customer', 'Existing Customer'],
  ['partner', 'Partner'],
  ['public relations', 'Public Relations'],
  ['campaign', 'Campaign'],
  ['other', 'Other'],
];

type FormErrors = {
  lead_attachment?: string[];
  amount?: string[];
  description?: string[];
  assigned_to?: string[];
  contacts?: string[];
  status?: string[];
  lead_source?: string[]; // Updated to match API field name
  source?: string[]; // Keep for backward compatibility
  tags?: string[];
  company?: string[];
  probability?: number[];
  file?: string[];
  link?: string[];
  title?: string[];
  lead_title?: string[]; // Adding lead_title for backend compatibility
};
interface FormData {
  // Main lead fields
  title: string;
  amount: number | ''; // Using number or empty string to handle initial state
  description: string;
  assigned_to: string; // Single UUID string, not an array
  contact: string; // Singular, not plural - single UUID string
  status: string;
  source: string;
  tags: string[];
  company: string;
  probability: number;
  lead_attachment: any[];
  file: string | null;
  link: string;
}

const getFileIcon = (fileName: string) => {
  if (!fileName) return <FaFile />;

  const extension = fileName.split('.').pop()?.toLowerCase() || '';

  switch (extension) {
    case 'pdf':
      return <FaFilePdf style={{ color: '#f40f02' }} />;
    case 'doc':
    case 'docx':
      return <FaFileWord style={{ color: '#2b579a' }} />;
    case 'xls':
    case 'xlsx':
    case 'csv':
      return <FaFileExcel style={{ color: '#217346' }} />;
    case 'ppt':
    case 'pptx':
      return <FaFilePowerpoint style={{ color: '#d24726' }} />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
    case 'webp':
    case 'tiff':
    case 'svg':
      return <FaFileImage style={{ color: '#7e4dd2' }} />;
    case 'zip':
    case 'rar':
    case '7z':
    case 'tar':
    case 'gz':
      return <FaFileArchive style={{ color: '#ffc107' }} />;
    case 'txt':
    case 'rtf':
      return <FaFileAlt style={{ color: '#5a6268' }} />;
    case 'html':
    case 'css':
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
    case 'json':
      return <FaFileCode style={{ color: '#0099e5' }} />;
    default:
      return <FaFile style={{ color: '#6c757d' }} />;
  }
};

// Function to truncate long filenames
const truncateFilename = (fileName: string, maxLength: number = 20) => {
  if (!fileName) return '';
  if (fileName.length <= maxLength) return fileName;

  const extension = fileName.includes('.') ? fileName.split('.').pop() : '';
  const nameWithoutExtension = fileName.includes('.')
    ? fileName.substring(0, fileName.lastIndexOf('.'))
    : fileName;

  // Calculate how much of the name we can show
  const availableChars = maxLength - 3; // 3 characters for ellipsis
  const truncatedName =
    nameWithoutExtension.substring(0, availableChars) + '...';

  return extension ? `${truncatedName}.${extension}` : truncatedName;
};

export function AddLeads() {
  const navigate = useNavigate();
  const { quill, quillRef } = useQuill();
  const initialContentRef = useRef(null);

  const autocompleteRef = useRef<any>(null);
  const [error, setError] = useState(false);

  // File handling state variables
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{
      url: string;
      originalUrl: string;
      fileName: string;
      fileType: string;
    }>
  >([]);
  const [fileUploading, setFileUploading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [tempUploadedFiles, setTempUploadedFiles] = useState<File[]>([]);

  const [sourceSelectOpen, setSourceSelectOpen] = useState(false);
  const [statusSelectOpen, setStatusSelectOpen] = useState(false);
  const [companySelectOpen, setCompanySelectOpen] = useState(false);
  const [contactSelectOpen, setContactSelectOpen] = useState(false);
  const [assignToSelectOpen, setAssignToSelectOpen] = useState(false);
  const [tagsSelectOpen, setTagsSelectOpen] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<FormData>({
    title: '',
    lead_attachment: [],
    amount: '',
    description: '',
    assigned_to: '', // Single string
    contact: '', // Singular field, single string
    status: 'new',
    source: 'call',
    tags: [],
    company: '',
    probability: 1,
    file: null,
    link: '',
  });

  // Company search states
  const [companyOptions, setCompanyOptions] = useState<CompanyOption[]>([]);
  const [companySearchTerm, setCompanySearchTerm] = useState('');
  const [companyLoading, setCompanyLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanyOption | null>(
    null
  );

  // Contact search states
  const [contactOptions, setContactOptions] = useState<ContactOption[]>([]);
  const [contactSearchTerm, setContactSearchTerm] = useState('');
  const [contactLoading, setContactLoading] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<ContactOption[]>([]);

  // User search states
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userLoading, setUserLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<UserOption[]>([]);

  // Debounce search terms to prevent excessive API calls
  const debouncedCompanySearch = useDebounce(companySearchTerm, 400);
  const debouncedContactSearch = useDebounce(contactSearchTerm, 400);
  const debouncedUserSearch = useDebounce(userSearchTerm, 400);

  useEffect(() => {
    if (quill) {
      // Save the initial state (HTML content) of the Quill editor
      initialContentRef.current = quillRef.current.firstChild.innerHTML;
    }
  }, [quill]);

  // Load companies when the component mounts or search term changes
  useEffect(() => {
    const loadCompanies = async () => {
      setCompanyLoading(true);
      const result = await fetchCompanyOptions(debouncedCompanySearch, 10);

      if (result.options) {
        setCompanyOptions(result.options);
      }
      setCompanyLoading(false);
    };

    loadCompanies();
  }, [debouncedCompanySearch]);

  // Initialize selected company if formData.company has a value
  useEffect(() => {
    if (formData.company && !selectedCompany) {
      const fetchCompanyDetail = async () => {
        setCompanyLoading(true);
        const result = await fetchCompanyOptions('', 100); // Fetch a larger batch to find the company
        const company = result.options.find(
          (option) => option.id === formData.company
        );
        if (company) {
          setSelectedCompany(company);
        }
        setCompanyLoading(false);
      };

      fetchCompanyDetail();
    }
  }, [formData.company, selectedCompany]);

  // Load contacts when the search term changes or when the company changes
  useEffect(() => {
    const loadContacts = async () => {
      setContactLoading(true);
      const result = await fetchContactOptions(
        debouncedContactSearch,
        formData.company, // Filter contacts by selected company
        10
      );

      if (result.options) {
        setContactOptions(result.options);
      }
      setContactLoading(false);
    };

    // Only load contacts if we have a company selected or if user is searching
    if (formData.company || debouncedContactSearch) {
      loadContacts();
    } else {
      // Clear contact options if no company is selected
      setContactOptions([]);
    }
  }, [debouncedContactSearch, formData.company]);

  // Update selected contact whenever formData.contact changes
  useEffect(() => {
    if (formData.contact && selectedContacts.length === 0) {
      const fetchSelectedContact = async () => {
        // Fetch all contacts for the selected company (we'll filter them on the client side)
        const result = await fetchContactOptions('', formData.company, 100);

        if (result.options) {
          // Find the contact that matches the ID in formData.contact
          const selected = result.options.filter(
            (contact) => contact.id === formData.contact
          );

          if (selected.length > 0) {
            setSelectedContacts([selected[0]]);
          }
        }
      };

      fetchSelectedContact();
    }
  }, [formData.contact, selectedContacts, formData.company]);

  // Reset contact when company changes
  useEffect(() => {
    // Watch for changes to the selected company
    if (selectedCompany) {
      // If current company ID is different from the one in formData
      if (selectedCompany.id !== formData.company) {
        // Reset contact-related fields
        setFormData((prev) => ({
          ...prev,
          contact: '', // Clear contact ID
          company: selectedCompany.id, // Update company ID
        }));
        setSelectedContacts([]); // Clear selected contacts
        setContactSearchTerm(''); // Clear search term
        setContactOptions([]); // Clear contact options
      }
    }
  }, [selectedCompany]);

  // Load users when the component mounts or search term changes
  useEffect(() => {
    const loadUsers = async () => {
      setUserLoading(true);
      const result = await fetchUserOptions(debouncedUserSearch);

      if (result.options) {
        setUserOptions(result.options);
      }
      setUserLoading(false);
    };

    loadUsers();
  }, [debouncedUserSearch]);

  // Initialize selected user if formData.assigned_to has a value
  useEffect(() => {
    if (formData.assigned_to && selectedUsers.length === 0) {
      const fetchSelectedUser = async () => {
        setUserLoading(true);
        const result = await fetchUserOptions('');

        if (result.options) {
          // Find the user that matches the ID in formData.assigned_to
          const selected = result.options.find(
            (user) => user.id === formData.assigned_to
          );

          if (selected) {
            setSelectedUsers([selected]);
          }
        }
        setUserLoading(false);
      };

      fetchSelectedUser();
    }
  }, [formData.assigned_to, selectedUsers]);

  // No longer need handleChange2 as we're using Select dropdowns for all fields

  const handleChange = (e: any) => {
    // const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files, type, checked, id } = e.target;

    // Clear error message for the field being changed
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof FormErrors];
        return newErrors;
      });
    }

    if (type === 'file') {
      setFormData({ ...formData, [name]: e.target.files?.[0] || null });
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else if (name === 'amount') {
      // Only allow numbers and decimal point
      // Remove any non-numeric characters except decimal point
      // Also ensure only one decimal point is allowed
      const numericValue = value.replace(/[^\d.]/g, '');
      const parts = numericValue.split('.');
      const formattedValue =
        parts[0] + (parts.length > 1 ? '.' + parts[1].slice(0, 2) : '');

      // Convert to number or keep as empty string
      const finalValue = formattedValue === '' ? '' : Number(formattedValue);

      setFormData({ ...formData, [name]: finalValue });
    } else if (name === 'probability') {
      // Only allow integers between 0 and 100
      // Remove any non-numeric characters
      const numericValue = value.replace(/\D/g, '');

      // Ensure value is between 0 and 100
      let finalValue = numericValue === '' ? 0 : parseInt(numericValue, 10);
      if (finalValue > 100) finalValue = 100;

      setFormData({ ...formData, [name]: finalValue });
    } else {
      setFormData({ ...formData, [name]: value });

      // For title field, validate dynamically
      if (name === 'title') {
        if (value.trim() !== '') {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.title;
            delete newErrors.lead_title; // Also clear the lead_title error
            return newErrors;
          });
        }
      }
    }
  };

  // Handle file upload button click
  const handleFileUploadClick = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    // Accept all the file types we support
    fileInput.accept =
      '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv,.rtf,.zip,.rar,.7z,.tar,.gz,.psd,.ai,.eps,.ttf,.otf,.woff,.woff2,.jpg,.jpeg,.png,.gif,.webp,.bmp,.tiff,.ico,.heic,.svg,.avif,.jfif';

    fileInput.addEventListener('change', async (event: any) => {
      const files = event.target.files;
      if (files && files[0]) {
        const file = files[0];

        // Check if file type is allowed
        if (!isFileTypeAllowed(file)) {
          setFileError(
            'This file type is not supported. Please select a different file.'
          );
          return;
        }

        // Show loading indicator
        setFileUploading(true);
        setFileError(null);

        try {
          // Add the file to temp uploaded files for UI feedback
          setTempUploadedFiles((prev) => [...prev, file]);

          // Upload file to Cloudinary (but don't attach yet)
          const result = await uploadFileToCloudinary(file);

          if (result.success) {
            // Store the uploaded file info
            setUploadedFiles((prev) => [
              ...prev,
              {
                url: result.url,
                originalUrl: result.originalUrl || result.url,
                fileName: file.name,
                fileType: file.type,
              },
            ]);

            // Remove from temp files
            setTempUploadedFiles((prev) =>
              prev.filter((f) => f.name !== file.name)
            );
          } else {
            setFileError(`Failed to upload file: ${result.error}`);

            // Remove from temp files if upload fails
            setTempUploadedFiles((prev) =>
              prev.filter((f) => f.name !== file.name)
            );
          }
        } catch (error) {
          console.error('Error uploading file:', error);
          setFileError('An error occurred while uploading the file.');

          // Remove from temp files if upload fails
          setTempUploadedFiles((prev) =>
            prev.filter((f) => f.name !== file.name)
          );
        } finally {
          // Hide loading indicator
          setFileUploading(false);
        }
      }
    });

    fileInput.click();
  };

  // Remove file from uploaded files
  const removeUploadedFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // This is kept for compatibility with existing code, but we'll use the new handleFileUploadClick instead
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    // This is now deprecated in favor of our new upload system
    const file = event.target.files?.[0] || null;
    if (file) {
      // Instead of using this function, we now use handleFileUploadClick
      // but keeping this for backward compatibility
      const reader = new FileReader();
      reader.onload = () => {
        setFormData({ ...formData, file: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const resetQuillToInitialState = () => {
    // Reset the Quill editor to its initial state
    setFormData({ ...formData, description: '' });
    if (quill && initialContentRef.current !== null) {
      quill.clipboard.dangerouslyPasteHTML(initialContentRef.current);
    }
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    submitForm();
  };
  const submitForm = () => {
    console.log('Selected users:', selectedUsers);

    // Validate required fields
    const newErrors: FormErrors = {};
    let hasErrors = false;

    // Check required fields
    if (!formData.title || formData.title.trim() === '') {
      newErrors.title = ['Lead Title is required'];
      newErrors.lead_title = ['Lead Title is required']; // Add error for lead_title as well for API validation
      hasErrors = true;
    }

    if (!formData.company) {
      newErrors.company = ['Company is required'];
      hasErrors = true;
    }

    if (!formData.contact) {
      newErrors.contacts = ['Contact is required'];
      hasErrors = true;
    }

    if (!formData.assigned_to) {
      newErrors.assigned_to = ['Assignment is required'];
      hasErrors = true;
    }

    if (!formData.description || formData.description === '<p><br></p>') {
      newErrors.description = ['Description is required'];
      hasErrors = true;
    }

    // If validation fails, update errors and stop form submission
    if (hasErrors) {
      setError(true);
      setErrors(newErrors);
      return;
    }

    // Format amount to 2 decimal places if it exists
    const formattedAmount =
      formData.amount !== '' ? Number(formData.amount).toFixed(2) : '';

    const data = {
      lead_title: formData.title, // Changed from title to lead_title to match backend API
      amount: formattedAmount !== '' ? Number(formattedAmount) : null,
      description: formData.description,
      // The API expects a single UUID string for assigned_to
      assigned_to: formData.assigned_to,
      // The field should be contact (singular), not contacts (plural)
      contact: formData.contact,
      status: formData.status,
      lead_source: formData.source, // Swagger API expects 'lead_source' not 'source'
      tags: formData.tags,
      company: formData.company,
      // Ensure probability is a number between 0 and 100
      probability: Number(formData.probability),
      link: formData.link,
    };

    // Log the final data being sent to the API
    console.log('Final data being sent to API:', JSON.stringify(data, null, 2));
    console.log('Submitting assigned_to:', data.assigned_to);

    const Header = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('Token'),
      org: localStorage.getItem('org'),
    };

    // Making a direct POST request to LeadUrl, independent from other pages
    fetchData(`${LeadUrl}/`, 'POST', JSON.stringify(data), Header)
      .then((res: any) => {
        console.log('Lead created successfully:', res);

        if (!res.error) {
          const newLeadId = res.id; // Get the new lead ID

          // If we have uploaded files, attach them to the newly created lead
          if (uploadedFiles.length > 0) {
            // Show a loading message or indicator
            setFileUploading(true);

            // Attach each uploaded file to the new lead
            const attachPromises = uploadedFiles.map((file) => {
              return attachFileToLead(
                newLeadId,
                file.originalUrl,
                file.fileName,
                file.fileType,
                Header
              );
            });

            // Wait for all attachment operations to complete
            Promise.all(attachPromises)
              .then(() => {
                // Navigate to leads page after all files are attached
                resetForm();
                navigate('/app/leads');
              })
              .catch((err) => {
                console.error('Error attaching files to lead:', err);
                // Still navigate to leads page even if some attachments fail
                resetForm();
                navigate('/app/leads');
              })
              .finally(() => {
                setFileUploading(false);
              });
          } else {
            // No files to attach, just navigate
            resetForm();
            navigate('/app/leads');
          }
        } else {
          setError(true);
          setErrors(res?.errors);
        }
      })
      .catch((error) => {
        console.error('Error creating lead:', error);
        setError(true);
      });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      lead_attachment: [],
      amount: '',
      description: '',
      assigned_to: '',
      contact: '',
      status: 'new',
      source: 'call',
      tags: [],
      company: '',
      probability: 1,
      file: null,
      link: '',
    });
    setErrors({});
    setSelectedCompany(null);
    setCompanySearchTerm('');
    setSelectedContacts([]);
    setContactSearchTerm('');
    setContactOptions([]);
    setSelectedUsers([]);
    setUserSearchTerm('');
    setUserOptions([]);

    // Clear file upload states
    setUploadedFiles([]);
    setTempUploadedFiles([]);
    setFileError(null);
    setFileUploading(false);

    // Reset Quill editor
    if (quill && initialContentRef.current !== null) {
      quill.clipboard.dangerouslyPasteHTML('');
    }

    // No longer need to reset selectedAssignTo and selectedTags as we're using direct state in formData
    // if (autocompleteRef.current) {
    //   console.log(autocompleteRef.current,'ccc')
    //   autocompleteRef.current.defaultValue([]);
    // }
  };
  const onCancel = () => {
    resetForm();
  };

  const backbtnHandle = () => {
    navigate('/app/leads');
  };

  const module = 'Leads';
  const crntPage = 'Add Leads';
  const backBtn = 'Back To Leads';

  // console.log(state, 'leadsform')
  return (
    <Box sx={{ mt: '60px' }}>
      <CustomAppBar
        backbtnHandle={backbtnHandle}
        module={module}
        backBtn={backBtn}
        crntPage={crntPage}
        onCancel={onCancel}
        onSubmit={handleSubmit}
      />
      <Box sx={{ mt: '120px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ padding: '10px' }}>
            <div className="leadContainer">
              <Accordion defaultExpanded style={{ width: '98%' }}>
                <AccordionSummary
                  expandIcon={<FiChevronDown style={{ fontSize: '25px' }} />}
                >
                  <Typography className="accordion-header">
                    Lead Information
                  </Typography>
                </AccordionSummary>
                <Divider className="divider" />
                <AccordionDetails>
                  <Box
                    sx={{ width: '98%', color: '#1A3353', mb: 1 }}
                    component="form"
                    noValidate
                    autoComplete="off"
                  >
                    <div className="fieldContainer2">
                      <div className="fieldSubContainer">
                        <div className="fieldTitle">
                          Lead Title <span style={{ color: 'red' }}>*</span>
                        </div>
                        <TextField
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          style={{ width: '70%' }}
                          size="small"
                          helperText={
                            errors?.title?.[0] ? errors?.title[0] : ''
                          }
                          error={!!errors?.title?.[0]}
                          required
                        />
                      </div>
                      <div className="fieldSubContainer">
                        <div className="fieldTitle">
                          Assign To <span style={{ color: 'red' }}>*</span>
                        </div>
                        <FormControl sx={{ width: '70%' }}>
                          <Autocomplete
                            // Remove multiple selection since API expects a single user
                            id="assign-to-select"
                            options={userOptions}
                            loading={userLoading}
                            value={
                              selectedUsers.length > 0 ? selectedUsers[0] : null
                            }
                            onChange={(event, newValue) => {
                              setSelectedUsers(newValue ? [newValue] : []);
                              // Use the top-level profile ID, not the user_details.id
                              setFormData({
                                ...formData,
                                assigned_to: newValue ? newValue.id : '',
                              });

                              // Clear error message if a valid selection is made
                              if (newValue && errors.assigned_to) {
                                setErrors((prev) => {
                                  const newErrors = { ...prev };
                                  delete newErrors.assigned_to;
                                  return newErrors;
                                });
                              }

                              console.log(
                                'Selected user for assignment:',
                                newValue
                                  ? {
                                      id: newValue.id,
                                      user_details_id:
                                        newValue.user_details?.id,
                                    }
                                  : 'None'
                              );
                            }}
                            onInputChange={(event, newInputValue) => {
                              setUserSearchTerm(newInputValue);
                            }}
                            getOptionLabel={(option) => {
                              // Get the name from user_details if available, otherwise fall back to old properties
                              const firstName =
                                option.user_details?.first_name ||
                                option.user__first_name ||
                                '';
                              const lastName =
                                option.user_details?.last_name ||
                                option.user__last_name ||
                                '';
                              return `${firstName} ${lastName}`.trim();
                            }}
                            isOptionEqualToValue={(option, value) =>
                              option.id === value.id
                            }
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                size="small"
                                placeholder="Search users..."
                                error={!!errors?.assigned_to?.[0]}
                                helperText={errors?.assigned_to?.[0] || ''}
                                InputProps={{
                                  ...params.InputProps,
                                  endAdornment: (
                                    <>
                                      {userLoading ? (
                                        <CircularProgress
                                          color="inherit"
                                          size={20}
                                        />
                                      ) : null}
                                      {params.InputProps.endAdornment}
                                    </>
                                  ),
                                }}
                              />
                            )}
                            renderOption={(props, option) => {
                              // Get the name and email from user_details if available, otherwise fall back to old properties
                              const firstName =
                                option.user_details?.first_name ||
                                option.user__first_name ||
                                '';
                              const lastName =
                                option.user_details?.last_name ||
                                option.user__last_name ||
                                '';
                              const email =
                                option.user_details?.email ||
                                option.user__email ||
                                '';

                              return (
                                <li {...props}>
                                  <Stack
                                    direction="row"
                                    spacing={1}
                                    alignItems="center"
                                  >
                                    <Avatar
                                      sx={{
                                        bgcolor: '#284871',
                                        width: 28,
                                        height: 28,
                                        fontSize: 14,
                                      }}
                                    >
                                      {firstName.charAt(0).toUpperCase() || 'U'}
                                    </Avatar>
                                    <div>
                                      <Typography variant="body1">
                                        {`${firstName} ${lastName}`.trim()}
                                      </Typography>
                                      {email && (
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                        >
                                          {email}
                                        </Typography>
                                      )}
                                    </div>
                                  </Stack>
                                </li>
                              );
                            }}
                          />
                        </FormControl>
                      </div>
                    </div>
                    <div className="fieldContainer2">
                      <div className="fieldSubContainer">
                        <div className="fieldTitle">
                          Company <span style={{ color: 'red' }}>*</span>
                        </div>
                        <FormControl sx={{ width: '70%' }}>
                          <Autocomplete
                            id="company-autocomplete"
                            options={companyOptions}
                            getOptionLabel={(option) => option.name || ''}
                            value={selectedCompany}
                            onChange={(event, newValue) => {
                              setSelectedCompany(newValue);
                              setFormData({
                                ...formData,
                                company: newValue ? newValue.id : '',
                                // Clear contact when company is cleared
                                contact: newValue ? formData.contact : '',
                              });

                              // When company is cleared, also clear contact-related states
                              if (!newValue) {
                                setSelectedContacts([]);
                                setContactSearchTerm('');
                                setContactOptions([]);
                              }

                              // Clear error message if a valid selection is made
                              if (newValue && errors.company) {
                                setErrors((prev) => {
                                  const newErrors = { ...prev };
                                  delete newErrors.company;
                                  return newErrors;
                                });
                              }
                            }}
                            onInputChange={(event, newInputValue) => {
                              setCompanySearchTerm(newInputValue);
                            }}
                            loading={companyLoading}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                size="small"
                                placeholder="Search companies..."
                                error={!!errors?.company?.[0]}
                                helperText={errors?.company?.[0] || ''}
                                InputProps={{
                                  ...params.InputProps,
                                  endAdornment: (
                                    <>
                                      {companyLoading ? (
                                        <CircularProgress
                                          color="inherit"
                                          size={20}
                                        />
                                      ) : null}
                                      {params.InputProps.endAdornment}
                                    </>
                                  ),
                                }}
                              />
                            )}
                            renderOption={(props, option) => (
                              <li {...props}>
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  alignItems="center"
                                >
                                  <Avatar
                                    sx={{
                                      bgcolor: '#284871',
                                      width: 28,
                                      height: 28,
                                      fontSize: 14,
                                    }}
                                  >
                                    {option.name?.charAt(0).toUpperCase() ||
                                      'C'}
                                  </Avatar>
                                  <div>
                                    <Typography variant="body1">
                                      {option.name}
                                    </Typography>
                                    {option.email && (
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        {option.email}
                                      </Typography>
                                    )}
                                  </div>
                                </Stack>
                              </li>
                            )}
                          />
                        </FormControl>
                      </div>
                      <div className="fieldSubContainer">
                        <div className="fieldTitle">
                          Contact <span style={{ color: 'red' }}>*</span>
                        </div>
                        <FormControl sx={{ width: '70%' }}>
                          <Autocomplete
                            // Remove multiple selection since API expects a single contact
                            id="contact-select"
                            options={contactOptions}
                            loading={contactLoading}
                            value={
                              selectedContacts.length > 0
                                ? selectedContacts[0]
                                : null
                            }
                            onChange={(event, newValue) => {
                              setSelectedContacts(newValue ? [newValue] : []);
                              setFormData({
                                ...formData,
                                contact: newValue ? newValue.id : '',
                              });

                              // Clear error message if a valid selection is made
                              if (newValue && errors.contacts) {
                                setErrors((prev) => {
                                  const newErrors = { ...prev };
                                  delete newErrors.contacts;
                                  return newErrors;
                                });
                              }
                            }}
                            onInputChange={(event, newInputValue) => {
                              setContactSearchTerm(newInputValue);
                            }}
                            getOptionLabel={(option) =>
                              `${option.first_name} ${option.last_name}`.trim()
                            }
                            isOptionEqualToValue={(option, value) =>
                              option.id === value.id
                            }
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                size="small"
                                placeholder={
                                  formData.company
                                    ? 'Search contacts...'
                                    : 'Select a company first'
                                }
                                error={!!errors?.contacts?.[0]}
                                helperText={errors?.contacts?.[0] || ''}
                                InputProps={{
                                  ...params.InputProps,
                                  endAdornment: (
                                    <>
                                      {contactLoading ? (
                                        <CircularProgress
                                          color="inherit"
                                          size={20}
                                        />
                                      ) : null}
                                      {params.InputProps.endAdornment}
                                    </>
                                  ),
                                }}
                              />
                            )}
                            renderOption={(props, option) => (
                              <li {...props}>
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  alignItems="center"
                                >
                                  <Avatar
                                    sx={{
                                      bgcolor: '#284871',
                                      width: 28,
                                      height: 28,
                                      fontSize: 14,
                                    }}
                                  >
                                    {option.first_name
                                      ?.charAt(0)
                                      .toUpperCase() || 'C'}
                                  </Avatar>
                                  <div>
                                    <Typography variant="body1">
                                      {`${option.first_name} ${option.last_name}`.trim()}
                                    </Typography>
                                    {option.primary_email && (
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        {option.primary_email}
                                      </Typography>
                                    )}
                                  </div>
                                </Stack>
                              </li>
                            )}
                            disabled={!formData.company} // Disable if no company is selected
                          />
                        </FormControl>
                      </div>
                    </div>
                    <div className="fieldContainer2">
                      <div className="fieldSubContainer">
                        <div className="fieldTitle">Source</div>
                        <FormControl sx={{ width: '70%' }}>
                          <Select
                            name="source"
                            value={formData.source}
                            open={sourceSelectOpen}
                            onClick={() =>
                              setSourceSelectOpen(!sourceSelectOpen)
                            }
                            IconComponent={() => (
                              <div
                                onClick={() =>
                                  setSourceSelectOpen(!sourceSelectOpen)
                                }
                                className="select-icon-background"
                              >
                                {sourceSelectOpen ? (
                                  <FiChevronUp className="select-icon" />
                                ) : (
                                  <FiChevronDown className="select-icon" />
                                )}
                              </div>
                            )}
                            className={'select'}
                            onChange={handleChange}
                            error={
                              !!errors?.lead_source?.[0] ||
                              !!errors?.source?.[0]
                            }
                          >
                            {MOCK_SOURCES.map((option: any) => (
                              <MenuItem key={option[0]} value={option[0]}>
                                {option[1]}
                              </MenuItem>
                            ))}
                          </Select>
                          <FormHelperText>
                            {errors?.lead_source?.[0] ||
                              errors?.source?.[0] ||
                              ''}
                          </FormHelperText>
                        </FormControl>
                      </div>{' '}
                      <div className="fieldSubContainer">
                        <div className="fieldTitle">Tags</div>
                        <FormControl sx={{ width: '70%' }}>
                          <Select
                            name="tags"
                            value={
                              formData.tags.length > 0 ? formData.tags[0] : ''
                            }
                            open={tagsSelectOpen}
                            onClick={() => setTagsSelectOpen(!tagsSelectOpen)}
                            IconComponent={() => (
                              <div
                                onClick={() =>
                                  setTagsSelectOpen(!tagsSelectOpen)
                                }
                                className="select-icon-background"
                              >
                                {tagsSelectOpen ? (
                                  <FiChevronUp className="select-icon" />
                                ) : (
                                  <FiChevronDown className="select-icon" />
                                )}
                              </div>
                            )}
                            className={'select'}
                            onChange={(e) => {
                              const value = e.target.value;
                              setFormData({
                                ...formData,
                                tags: value ? [value] : [],
                              });
                            }}
                            error={!!errors?.tags?.[0]}
                          >
                            {MOCK_TAGS.map((option: string) => (
                              <MenuItem key={option} value={option}>
                                {option}
                              </MenuItem>
                            ))}
                          </Select>
                          <FormHelperText>
                            {errors?.tags?.[0] ? errors?.tags[0] : ''}
                          </FormHelperText>
                        </FormControl>
                      </div>
                    </div>
                    <div className="fieldContainer2">
                      <div className="fieldSubContainer">
                        <div className="fieldTitle">Amount</div>
                        <TextField
                          name="amount"
                          value={formData.amount}
                          onChange={handleChange}
                          style={{ width: '70%' }}
                          size="small"
                          type="text"
                          placeholder="0.00"
                          onKeyDown={(e) => {
                            // Allow only numbers, decimal point, backspace, delete, tab, arrows
                            const allowedKeys = [
                              'Backspace',
                              'Delete',
                              'Tab',
                              'ArrowLeft',
                              'ArrowRight',
                              'ArrowUp',
                              'ArrowDown',
                            ];
                            const isNumber = /[0-9]/.test(e.key);
                            const isDecimal = e.key === '.';
                            const isAllowedKey = allowedKeys.includes(e.key);

                            // Prevent more than one decimal point
                            if (
                              isDecimal &&
                              String(formData.amount).includes('.')
                            ) {
                              e.preventDefault();
                              return;
                            }

                            // Prevent input if not a number, decimal, or allowed key
                            if (!isNumber && !isDecimal && !isAllowedKey) {
                              e.preventDefault();
                            }
                          }}
                          helperText={
                            errors?.amount?.[0] ? errors?.amount[0] : ''
                          }
                          error={!!errors?.amount?.[0]}
                        />
                      </div>

                      <div className="fieldSubContainer">
                        <div className="fieldTitle">Probability</div>
                        <TextField
                          name="probability"
                          value={formData.probability}
                          onChange={handleChange}
                          type="text"
                          placeholder="0-100"
                          onKeyDown={(e) => {
                            // Allow only numbers, backspace, delete, tab, arrows
                            const allowedKeys = [
                              'Backspace',
                              'Delete',
                              'Tab',
                              'ArrowLeft',
                              'ArrowRight',
                              'ArrowUp',
                              'ArrowDown',
                            ];
                            const isNumber = /[0-9]/.test(e.key);
                            const isAllowedKey = allowedKeys.includes(e.key);

                            // Prevent input if not a number or allowed key
                            if (!isNumber && !isAllowedKey) {
                              e.preventDefault();
                            }
                          }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  disableFocusRipple
                                  disableTouchRipple
                                  sx={{
                                    backgroundColor: '#d3d3d34a',
                                    width: '45px',
                                    borderRadius: '0px',
                                    mr: '-12px',
                                  }}
                                >
                                  <FaPercent style={{ width: '12px' }} />
                                </IconButton>
                              </InputAdornment>
                            ),
                            inputProps: { min: 0, max: 100 }, // HTML5 validation attributes
                          }}
                          style={{ width: '70%' }}
                          size="small"
                          helperText={
                            errors?.probability?.[0]
                              ? errors?.probability[0]
                              : ''
                          }
                          error={!!errors?.probability?.[0]}
                        />
                      </div>
                    </div>
                    <div className="fieldContainer2">
                      <div className="fieldSubContainer">
                        <div className="fieldTitle">Status</div>
                        <FormControl sx={{ width: '70%' }}>
                          <Select
                            name="status"
                            value={formData.status}
                            open={statusSelectOpen}
                            onClick={() =>
                              setStatusSelectOpen(!statusSelectOpen)
                            }
                            IconComponent={() => (
                              <div
                                onClick={() =>
                                  setStatusSelectOpen(!statusSelectOpen)
                                }
                                className="select-icon-background"
                              >
                                {statusSelectOpen ? (
                                  <FiChevronUp className="select-icon" />
                                ) : (
                                  <FiChevronDown className="select-icon" />
                                )}
                              </div>
                            )}
                            className={'select'}
                            onChange={handleChange}
                            error={!!errors?.status?.[0]}
                          >
                            {MOCK_STATUS.map((option: any) => (
                              <MenuItem key={option[0]} value={option[0]}>
                                {option[1]}
                              </MenuItem>
                            ))}
                          </Select>
                          <FormHelperText>
                            {errors?.status?.[0] ? errors?.status[0] : ''}
                          </FormHelperText>
                        </FormControl>
                      </div>

                      <div className="fieldSubContainer">
                        <div className="fieldTitle">Link</div>
                        <TextField
                          name="link"
                          value={formData.link}
                          onChange={handleChange}
                          style={{ width: '70%' }}
                          size="small"
                          helperText={errors?.link?.[0] ? errors?.link[0] : ''}
                          error={!!errors?.link?.[0]}
                        />
                      </div>
                    </div>
                    <div className="fieldContainer2">
                      {' '}
                      <div className="fieldSubContainer">
                        <div className="fieldTitle">Attachments</div>

                        {fileError && (
                          <Alert severity="error" sx={{ mb: 2 }}>
                            {fileError}
                          </Alert>
                        )}

                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '5px',
                          }}
                        >
                          <Box
                            sx={{
                              border: '1px solid #e0e0e0',
                              borderRadius: '4px',
                              height:
                                uploadedFiles.length > 0 ||
                                tempUploadedFiles.length > 0
                                  ? 'auto'
                                  : '38px',
                              minHeight:
                                uploadedFiles.length > 0 ||
                                tempUploadedFiles.length > 0
                                  ? '100px'
                                  : '38px',
                              maxHeight: '150px',
                              overflowY: 'auto',
                              backgroundColor: 'white',
                              display: 'flex',
                              flexDirection: 'column',
                              p:
                                uploadedFiles.length > 0 ||
                                tempUploadedFiles.length > 0
                                  ? 1
                                  : 0,
                            }}
                          >
                            {/* Show uploaded files */}
                            {uploadedFiles.length > 0 ||
                            tempUploadedFiles.length > 0 ? (
                              <Box sx={{ p: 1 }}>
                                {/* Show successfully uploaded files */}
                                {uploadedFiles.map((file, index) => (
                                  <Box
                                    key={`file-${index}`}
                                    sx={{
                                      p: 0.5,
                                      mb: 0.5,
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      borderRadius: '4px',
                                      border: '1px solid #e0e0e0',
                                      backgroundColor: '#f9f9f9',
                                      '&:hover': {
                                        backgroundColor: '#f0f0f0',
                                      },
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        flex: 1,
                                        overflow: 'hidden',
                                      }}
                                    >
                                      <Avatar
                                        sx={{
                                          mr: 1,
                                          width: 22,
                                          height: 22,
                                          bgcolor: 'action.hover',
                                          fontSize: '0.75rem',
                                        }}
                                      >
                                        {getFileIcon(file.fileName)}
                                      </Avatar>
                                      <Typography
                                        variant="body2"
                                        sx={{ fontSize: '0.875rem' }}
                                      >
                                        {truncateFilename(file.fileName, 25)}
                                      </Typography>
                                    </Box>
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() => removeUploadedFile(index)}
                                      disabled={fileUploading}
                                      sx={{
                                        p: '2px',
                                        mr: 0.5,
                                        opacity: 0.7,
                                        '&:hover': { opacity: 1 },
                                      }}
                                    >
                                      <FaTimes size={12} />
                                    </IconButton>
                                  </Box>
                                ))}

                                {/* Show temporary files being uploaded */}
                                {tempUploadedFiles.map((file, index) => (
                                  <Box
                                    key={`temp-${index}`}
                                    sx={{
                                      p: 0.5,
                                      mb: 0.5,
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      borderRadius: '4px',
                                      border: '1px solid #bbdefb',
                                      backgroundColor: '#e3f2fd',
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        flex: 1,
                                        overflow: 'hidden',
                                      }}
                                    >
                                      <Avatar
                                        sx={{
                                          mr: 1,
                                          width: 22,
                                          height: 22,
                                          bgcolor: '#bbdefb',
                                          fontSize: '0.75rem',
                                        }}
                                      >
                                        {getFileIcon(file.name)}
                                      </Avatar>
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          fontStyle: 'italic',
                                          fontSize: '0.875rem',
                                        }}
                                      >
                                        {truncateFilename(file.name, 25)}{' '}
                                        (uploading...)
                                      </Typography>
                                    </Box>
                                    <CircularProgress
                                      size={14}
                                      sx={{ mr: 0.5 }}
                                    />
                                  </Box>
                                ))}
                              </Box>
                            ) : (
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  height: '100%',
                                  color: 'text.secondary',
                                  fontSize: '0.875rem',
                                }}
                              >
                                No attachments
                              </Box>
                            )}
                          </Box>

                          <Box
                            sx={{
                              width: '100%',
                              display: 'flex',
                              mt: 1,
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <Button
                              size="small"
                              color="primary"
                              variant="contained"
                              startIcon={
                                fileUploading ? (
                                  <CircularProgress size={16} />
                                ) : (
                                  <FaFileUpload />
                                )
                              }
                              onClick={handleFileUploadClick}
                              disabled={fileUploading}
                              sx={{ py: 0.5 }}
                            >
                              Upload File
                            </Button>
                          </Box>
                        </Box>
                      </div>
                      <div className="fieldSubContainer">
                        {/* Empty container for layout balance */}
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
                    sx={{ width: '100%', mb: 1 }}
                    component="form"
                    noValidate
                    autoComplete="off"
                  >
                    <div className="DescriptionDetail">
                      <div className="descriptionTitle">
                        Description <span style={{ color: 'red' }}>*</span>
                      </div>
                      <div style={{ width: '100%', marginBottom: '3%' }}>
                        <div
                          ref={quillRef}
                          style={{
                            border: errors?.description
                              ? '1px solid red'
                              : undefined,
                          }}
                        />
                        {errors?.description && (
                          <FormHelperText error>
                            {errors.description[0]}
                          </FormHelperText>
                        )}
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
                          const content = quillRef.current.firstChild.innerHTML;
                          setFormData({ ...formData, description: content });
                          // Clear description error if content is now valid
                          if (content && content !== '<p><br></p>') {
                            setErrors((prev) => ({
                              ...prev,
                              description: undefined,
                            }));
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
    </Box>
  );
}
