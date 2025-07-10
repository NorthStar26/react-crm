import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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
  Switch,
  FormControlLabel,
  Paper,
  Alert,
  Snackbar,
  Link,
  Grid
} from '@mui/material'
import { useQuill } from 'react-quilljs';
import 'quill/dist/quill.snow.css';
import '../../styles/style.css'
import { LeadUrl, CompaniesUrl, ContactUrl, UsersUrl } from '../../services/ApiUrls'
import { fetchData, Header } from '../../components/FetchData'
import { fetchCompanyOptions, CompanyOption } from '../../services/companyService'
import { fetchContactOptions, ContactOption } from '../../services/contactService'
import { fetchUserOptions, UserOption } from '../../services/userService'
import { useDebounce } from '../../hooks/useDebounce'
import { CustomAppBar } from '../../components/CustomAppBar'
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
  FaEdit, 
  FaSave,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFilePowerpoint,
  FaFileImage,
  FaFileArchive,
  FaFile,
  FaFileAlt,
  FaFileCode,
  FaPaperclip
} from 'react-icons/fa'
import { useForm } from '../../components/UseForm'
import { CustomPopupIcon, CustomSelectField, RequiredTextField, StyledSelect } from '../../styles/CssStyled'
import { FiChevronDown } from '@react-icons/all-files/fi/FiChevronDown'
import { FiChevronUp } from '@react-icons/all-files/fi/FiChevronUp'
import { uploadFileToCloudinary, uploadAndAttachFileToLead, isFileTypeAllowed } from '../../utils/uploadFileToCloudinary'
import { DeleteModal } from '../../components/DeleteModal'

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

// Function to get the appropriate icon based on file extension
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
  const truncatedName = nameWithoutExtension.substring(0, availableChars) + '...';
  
  return extension ? `${truncatedName}.${extension}` : truncatedName;
};

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
  ['recycled', 'Recycled']
];
const MOCK_SOURCES: [string, string][] = [
  ['call', 'Call'],
  ['email', 'Email'],
  ['existing customer', 'Existing Customer'],
  ['partner', 'Partner'],
  ['public relations', 'Public Relations'],
  ['campaign', 'Campaign'],
  ['other', 'Other']
];

type FormErrors = {
  lead_attachment?: string[],
  amount?: string[],
  description?: string[],
  assigned_to?: string[],
  contacts?: string[],
  status?: string[],
  lead_source?: string[], // Updated to match API field name
  source?: string[], // Keep for backward compatibility
  tags?: string[],
  company?: string[],
  probability?: number[],
  file?: string[],
  link?: string[],
  title?: string[],
};

interface FormData {
  // Main lead fields
  title: string, // We'll keep this for form reference
  lead_title: string, // The actual API field name
  amount: number | '', // Using number or empty string to handle initial state
  description: string,
  assigned_to: string, // Single UUID string, not an array
  contact: string, // Singular, not plural - single UUID string
  status: string,
  source: string,
  tags: string[],
  company: string,
  probability: number,
  lead_attachment: any[], // Array of attachment objects
  file: string | null,
  link: string
}

export function EditLead() {
  const navigate = useNavigate()
  const { leadId } = useParams<{ leadId: string }>();
  const { quill, quillRef } = useQuill();
  const initialContentRef = useRef(null);

  const autocompleteRef = useRef<any>(null);
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isEditable, setIsEditable] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [sourceSelectOpen, setSourceSelectOpen] = useState(false)
  const [statusSelectOpen, setStatusSelectOpen] = useState(false)
  const [companySelectOpen, setCompanySelectOpen] = useState(false)
  const [contactSelectOpen, setContactSelectOpen] = useState(false)
  const [assignToSelectOpen, setAssignToSelectOpen] = useState(false)
  const [tagsSelectOpen, setTagsSelectOpen] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({});
  
  // File handling state variables
  const [fileUploading, setFileUploading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [attachmentToDelete, setAttachmentToDelete] = useState<string | null>(null);
  const [attachmentNameToDelete, setAttachmentNameToDelete] = useState<string>('');
  const [tempUploadedFiles, setTempUploadedFiles] = useState<File[]>([]);
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    lead_title: '',
    lead_attachment: [], // Initialize as empty array
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
    link: ''
  })
  
  // Company search states
  const [companyOptions, setCompanyOptions] = useState<CompanyOption[]>([]);
  const [companySearchTerm, setCompanySearchTerm] = useState('');
  const [companyLoading, setCompanyLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanyOption | null>(null);
  
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

  // Fetch lead data when component mounts
  useEffect(() => {
    if (leadId) {
      fetchLeadData(leadId);
    }
  }, [leadId]);

  // Fetch lead data from API
  const fetchLeadData = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetchData(`${LeadUrl}/${id}/`, 'GET', null as any, Header);
      
      if (response && response.lead_obj) {
        const lead = response.lead_obj;
        
        // Reset file upload related states
        setFileUploading(false);
        setFileError(null);
        setTempUploadedFiles([]);
        
        setFormData({
          title: lead.lead_title || '', // Use lead_title from API
          lead_title: lead.lead_title || '', // Store in both fields for consistency
          lead_attachment: lead.lead_attachment || [],
          amount: lead.amount || '',
          description: lead.description || '',
          assigned_to: lead.assigned_to ? lead.assigned_to.id : '',
          contact: lead.contact ? lead.contact.id : '',
          status: lead.status || 'new',
          source: lead.lead_source || 'call',
          tags: lead.tags || [],
          company: lead.company ? lead.company.id : '',
          probability: lead.probability || 1,
          file: null,
          link: lead.link || ''
        });                // Initialize Quill editor with lead description if it exists
                if (quill && lead.description) {
                  setTimeout(() => {
                    quill.clipboard.dangerouslyPasteHTML(lead.description);
                    // Use as any to avoid type errors
                    initialContentRef.current = lead.description as any;
                    
                    // Disable Quill editor initially (read-only mode)
                    quill.enable(false);
                  }, 100);
                }
      }
    } catch (error) {
      console.error('Error fetching lead data:', error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (quill && !initialContentRef.current && formData.description) {
      // Save the initial state (HTML content) of the Quill editor
      setTimeout(() => {
        quill.clipboard.dangerouslyPasteHTML(formData.description);
        // Use as any to avoid type errors
        initialContentRef.current = formData.description as any;
        
        // Disable Quill editor initially (read-only mode)
        quill.enable(false);
      }, 100);
    }
  }, [quill, formData.description]);
  
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
        try {
          setCompanyLoading(true);
          const result = await fetchCompanyOptions('', 100); // Fetch a larger batch to find the company
          const company = result.options.find(option => option.id === formData.company);
          if (company) {
            setSelectedCompany(company);
          } else {
            // If we can't find the company in the results,
            // try fetching the specific company directly
            try {
              const specificCompanyResponse = await fetchData(
                `${CompaniesUrl}/${formData.company}/`, 
                'GET', 
                null as any, 
                Header
              );
              
              if (specificCompanyResponse && !specificCompanyResponse.error) {
                const companyData = specificCompanyResponse.company_obj || specificCompanyResponse;
                setSelectedCompany({
                  id: companyData.id,
                  name: companyData.name || ''
                });
              }
            } catch (error) {
              console.error('Error fetching specific company:', error);
            }
          }
        } catch (error) {
          console.error('Error fetching companies for selection:', error);
        } finally {
          setCompanyLoading(false);
        }
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
        try {
          // Fetch all contacts for the selected company (we'll filter them on the client side)
          const result = await fetchContactOptions('', formData.company, 100);
          
          if (result.options) {
            // Find the contact that matches the ID in formData.contact
            const selected = result.options.filter(contact => 
              contact.id === formData.contact
            );
            
            if (selected.length > 0) {
              setSelectedContacts([selected[0]]);
            } else {
              // If we can't find the contact in the filtered results,
              // try fetching the specific contact directly (some APIs support this)
              try {
                const specificContactResponse = await fetchData(
                  `${ContactUrl}/${formData.contact}/`, 
                  'GET', 
                  null as any, 
                  Header
                );
                
                if (specificContactResponse && !specificContactResponse.error) {
                  const contactData = specificContactResponse.contact_obj || specificContactResponse;
                  setSelectedContacts([{
                    id: contactData.id,
                    first_name: contactData.first_name || '',
                    last_name: contactData.last_name || '',
                    primary_email: contactData.email || contactData.primary_email || '',
                    mobile_number: contactData.mobile_number || ''
                  }]);
                }
              } catch (error) {
                console.error('Error fetching specific contact:', error);
              }
            }
          }
        } catch (error) {
          console.error('Error fetching contacts for selection:', error);
        }
      };
      
      fetchSelectedContact();
    }
  }, [formData.contact, selectedContacts, formData.company]);
  
  // Reset contact when company changes
  useEffect(() => {
    const prevCompany = formData.company;
    
    // If company has changed, clear selected contact
    if (prevCompany && prevCompany !== formData.company) {
      setFormData(prev => ({
        ...prev,
        contact: ''
      }));
      setSelectedContacts([]);
      setContactSearchTerm('');
    }
  }, [formData.company]);
  
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
        try {
          setUserLoading(true);
          const result = await fetchUserOptions('');
          
          if (result.options) {
            // Find the user that matches the ID in formData.assigned_to
            const selected = result.options.find(user => 
              user.id === formData.assigned_to
            );
            
            if (selected) {
              setSelectedUsers([selected]);
            } else {
              // If we can't find the user in the results,
              // try fetching the specific user directly
              try {
                const specificUserResponse = await fetchData(
                  `${UsersUrl}/${formData.assigned_to}/`, 
                  'GET', 
                  null as any, 
                  Header
                );
                
                if (specificUserResponse && !specificUserResponse.error) {
                  const userData = specificUserResponse.user_obj || specificUserResponse;
                  setSelectedUsers([{
                    id: userData.id,
                    user_details: {
                      id: userData.user_details?.id,
                      first_name: userData.user_details?.first_name || '',
                      last_name: userData.user_details?.last_name || '',
                      email: userData.user_details?.email || userData.email || userData.user__email || '',
                      is_active: userData.user_details?.is_active || userData.is_active || true,
                      profile_pic: userData.user_details?.profile_pic || null
                    },
                    user__email: userData.user__email || userData.email || ''
                  }]);
                }
              } catch (error) {
                console.error('Error fetching specific user:', error);
              }
            }
          }
        } catch (error) {
          console.error('Error fetching users for selection:', error);
        } finally {
          setUserLoading(false);
        }
      };
      
      fetchSelectedUser();
    }
  }, [formData.assigned_to, selectedUsers]);

  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditable(!isEditable);

    if (!isEditable && quill) {
      // If switching to edit mode, ensure the Quill editor is enabled
      quill.enable(true);
    } else if (isEditable && quill) {
      // If switching to read-only mode, disable the Quill editor
      quill.enable(false);
    }
  };

  // Handle file upload button click
  const handleFileUploadClick = () => {
    // Only allow file uploads in edit mode
    if (!isEditable) {
      setSuccessMessage('Please enable edit mode to upload files');
      return;
    }
    
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    // Accept all the file types we support
    fileInput.accept = '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv,.rtf,.zip,.rar,.7z,.tar,.gz,.psd,.ai,.eps,.ttf,.otf,.woff,.woff2,.jpg,.jpeg,.png,.gif,.webp,.bmp,.tiff,.ico,.heic,.svg,.avif,.jfif';
    
    fileInput.addEventListener('change', async (event: any) => {
      const files = event.target.files;
      if (files && files[0]) {
        const file = files[0];
        
        // Check if file type is allowed
        if (!isFileTypeAllowed(file)) {
          setFileError('This file type is not supported. Please select a different file.');
          return;
        }
        
        // Show loading indicator
        setFileUploading(true);
        setFileError(null);
        
        try {
          // Add the file to temp uploaded files for UI feedback
          setTempUploadedFiles(prev => [...prev, file]);
          
          // Prepare headers for API request
          const headers = {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              Authorization: localStorage.getItem('Token'),
              org: localStorage.getItem('org')
          };
          
          // Upload and attach the file
          const result = await uploadAndAttachFileToLead(leadId as string, file, headers);
          
          if (result.success) {
            // Show success message
            setSuccessMessage(`File "${file.name}" was successfully uploaded`);
            
            // Refresh lead data to include the new attachment
            fetchLeadData(leadId as string);
          } else {
            setFileError(`Failed to upload file: ${result.error}`);
            
            // Remove from temp files if upload fails
            setTempUploadedFiles(prev => prev.filter(f => f.name !== file.name));
            
            // Show error alert
            setSuccessMessage(`Failed to upload file: ${result.error}`);
          }
        } catch (error) {
          console.error('Error uploading file:', error);
          setFileError('An error occurred while uploading the file.');
          
          // Remove from temp files if upload fails
          setTempUploadedFiles(prev => prev.filter(f => f.name !== file.name));
          
          // Show error alert
          setSuccessMessage('An error occurred while uploading the file.');
        } finally {
          // Hide loading indicator
          setFileUploading(false);
        }
      }
    });
    
    fileInput.click();
  };
  
  // Open delete confirmation modal
  const handleAttachmentDelete = (attachmentId: string, fileName: string = '') => {
    // Only allow deletion in edit mode
    if (!isEditable) {
      setSuccessMessage('Please enable edit mode to delete attachments');
      return;
    }
    
    setAttachmentToDelete(attachmentId);
    setAttachmentNameToDelete(fileName);
    setDeleteModalOpen(true);
  };
  
  // Handle actual deletion after confirmation
  const confirmAttachmentDelete = () => {
    if (!attachmentToDelete) return;
    
    // Show loading indicator
    setFileUploading(true);
    setFileError(null);
    
    // Use the Header object consistent with other API calls
    const Header = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('Token'),
      org: localStorage.getItem('org')
    };
    
    // Close the modal first
    setDeleteModalOpen(false);
    
    // Use fetchData function like other API calls
    fetchData(`/${LeadUrl}/attachment/${attachmentToDelete}/`, 'DELETE', null as any, Header)
      .then((res) => {
        if (!res.error) {
          // Success - refresh lead details to update the UI
          fetchLeadData(leadId as string);
          
          // Show success alert
          setSuccessMessage('Attachment was successfully deleted');
        } else {
          setFileError(res.error || 'Failed to delete attachment');
          setSuccessMessage(`Error: ${res.error || 'Failed to delete attachment'}`);
        }
      })
      .catch((err) => {
        console.error("Error deleting attachment:", err);
        setFileError('An error occurred while deleting the attachment');
        setSuccessMessage('An error occurred while deleting the attachment');
      })
      .finally(() => {
        setFileUploading(false);
      });
  };

  const handleChange = (e: any) => {
    // Only process changes if in edit mode
    if (!isEditable) return;

    const { name, value, files, type, checked, id } = e.target;
    
    // Clear error message for the field being changed
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof FormErrors];
        return newErrors;
      });
    }
    
    if (type === 'file') {
      setFormData({ ...formData, [name]: e.target.files?.[0] || null });
    }
    else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    }
    else if (name === 'amount') {
      // Only allow numbers and decimal point
      // Remove any non-numeric characters except decimal point
      // Also ensure only one decimal point is allowed
      const numericValue = value.replace(/[^\d.]/g, '');
      const parts = numericValue.split('.');
      const formattedValue = parts[0] + (parts.length > 1 ? '.' + parts[1].slice(0, 2) : '');
      
      // Convert to number or keep as empty string
      const finalValue = formattedValue === '' ? '' : Number(formattedValue);
      
      setFormData({ ...formData, [name]: finalValue });
    }
    else if (name === 'probability') {
      // Only allow integers between 0 and 100
      // Remove any non-numeric characters
      const numericValue = value.replace(/\D/g, '');
      
      // Ensure value is between 0 and 100
      let finalValue = numericValue === '' ? 0 : parseInt(numericValue, 10);
      if (finalValue > 100) finalValue = 100;
      
      setFormData({ ...formData, [name]: finalValue });
    }
    else {
      // Keep both title fields in sync when either one changes
      if (name === 'title' || name === 'lead_title') {
        setFormData({ 
          ...formData, 
          title: value, 
          lead_title: value 
        });
        
        // Validate dynamically
        if (value.trim() !== '') {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.title;
            return newErrors;
          });
        }
      } else {
        // Normal field handling for other fields
        setFormData({ ...formData, [name]: value });
      }
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    // Only process changes if in edit mode
    if (!isEditable) return;

    const file = event.target.files?.[0] || null;
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData({ ...formData, file: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const resetQuillToInitialState = () => {
    // Only reset if in edit mode
    if (!isEditable) return;

    // Reset the Quill editor to its initial state
    setFormData({ ...formData, description: '' })
    if (quill && initialContentRef.current !== null) {
      quill.clipboard.dangerouslyPasteHTML(initialContentRef.current);
    }
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    submitForm();
  }

  const submitForm = () => {
    // Only submit the form if in edit mode
    if (!isEditable) {
      return;
    }

    console.log('Selected users:', selectedUsers);
    
    // Validate required fields
    const newErrors: FormErrors = {};
    let hasErrors = false;
    
    // Check required fields
    if (!formData.lead_title || formData.lead_title.trim() === '') {
      newErrors.title = ['Lead Title is required'];
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
    
    // Get the current description from the Quill editor if it exists
    let currentDescription = formData.description;
    if (quill) {
      const quillContent = quill.root.innerHTML;
      // Only update if there's actual content (not just an empty paragraph)
      if (quillContent !== '<p><br></p>') {
        currentDescription = quillContent;
      }
    }
    
    if (!currentDescription || currentDescription === '<p><br></p>') {
      newErrors.description = ['Description is required'];
      hasErrors = true;
    }
    
    // If validation fails, update errors and stop form submission
    if (hasErrors) {
      setErrors(newErrors);
      // Don't set the general error, just show field-specific validation errors
      return;
    }
    
    // Format amount to 2 decimal places if it exists
    const formattedAmount = formData.amount !== '' 
      ? Number(formData.amount).toFixed(2) 
      : '';
    
    // Update description from Quill editor if needed
    const updatedFormData = {
      ...formData,
      description: currentDescription
    };
    
    const data = {
      lead_title: updatedFormData.lead_title, // Using lead_title instead of title to match API
      lead_attachment: updatedFormData.file,
      amount: formattedAmount !== '' ? Number(formattedAmount) : null,
      description: updatedFormData.description,
      // The API expects a single UUID string for assigned_to
      assigned_to: updatedFormData.assigned_to,
      // The field should be contact (singular), not contacts (plural)
      contact: updatedFormData.contact,
      status: updatedFormData.status,
      lead_source: updatedFormData.source, // Swagger API expects 'lead_source' not 'source'
      tags: updatedFormData.tags,
      company: updatedFormData.company,
      // Ensure probability is a number between 0 and 100
      probability: Number(updatedFormData.probability),
      link: updatedFormData.link
    }
    
    // Log the final data being sent to the API
    console.log('Final data being sent to API:', JSON.stringify(data, null, 2));

    // Making PUT request to update the lead
    fetchData(`${LeadUrl}/${leadId}/`, 'PUT', JSON.stringify(data), Header)
      .then((res: any) => {
        console.log('Lead updated successfully:', res);
        if (!res.error) {
          // After successful update, set to read-only mode
          setIsEditable(false);
          setSuccessMessage('Lead updated successfully!');
          // Navigate after a short delay to allow the success message to be seen
          setTimeout(() => {
            navigate(`/app/leads/${leadId}`);
          }, 1500);
        }
        if (res.error) {
          // Don't set general error, instead focus on field-specific errors
          // setError(true);
          setErrors(res?.errors || {});
          
          // Scroll to the first error field
          if (res?.errors) {
            const firstErrorField = Object.keys(res.errors)[0];
            const errorElement = document.getElementsByName(firstErrorField)[0];
            if (errorElement) {
              errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
              errorElement.focus();
            }
          }
        }
      })
      .catch((error) => {
        console.error('Error updating lead:', error);
        // Don't set general error state for validation issues
        // setError(true);
        
        if (error.errors) {
          setErrors(error.errors);
          
          // Scroll to the first error field
          const firstErrorField = Object.keys(error.errors)[0];
          const errorElement = document.getElementsByName(firstErrorField)[0];
          if (errorElement) {
            errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            errorElement.focus();
          }
        } else {
          // Only set general error if it's not a validation error
          setError(true);
        }
      });
  };

  const resetForm = () => {
    if (!isEditable) return;
    
    // Reset by fetching the lead data again
    fetchLeadData(leadId!);
    setErrors({});
    setSelectedCompany(null);
    setCompanySearchTerm('');
    setSelectedContacts([]);
    setContactSearchTerm('');
    setContactOptions([]);
    setSelectedUsers([]);
    setUserSearchTerm('');
    setUserOptions([]);
  }
  
  const onCancel = () => {
    resetForm();
    if (quill && initialContentRef.current !== null) {
      quill.clipboard.dangerouslyPasteHTML(initialContentRef.current);
    }
  }

  const backbtnHandle = () => {
    navigate(`/app/leads/${leadId}`);
  }

  const module = 'Leads';
  const crntPage = 'Edit Lead';
  const backBtn = 'Back To Lead Details';

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: '60px', p: 3 }}>
        <Typography color="error">Error loading lead data. Please try again later.</Typography>
        <Button variant="contained" onClick={() => fetchLeadData(leadId!)} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: '60px' }}>
      <CustomAppBar backbtnHandle={backbtnHandle} module={module} backBtn={backBtn} crntPage={crntPage} onCancel={onCancel} onSubmit={handleSubmit} />
      
      
      {/* Edit Mode Toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 18, mx: 3 }}>
        {/* Prominent Edit Button */}
        <Paper 
          elevation={3} 
          sx={{ 
            p: 1, 
            display: 'flex', 
            alignItems: 'center', 
            backgroundColor: isEditable ? '#e3f2fd' : 'white',
            borderRadius: '8px',
            border: isEditable ? '2px solid #2196f3' : '1px solid #e0e0e0',
            width: '320px',  // Fixed width to prevent size changes
            justifyContent: 'space-between' // Even spacing between elements
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', minWidth: '180px' }}>
            {!isEditable && (
              <Typography variant="body2" color="text.secondary">
                <FaTimesCircle style={{ color: '#f44336', marginRight: '5px' }} />
                Form is currently in read-only mode
              </Typography>
            )}
            {isEditable && (
              <Typography variant="body2" color="primary">
                <FaCheckCircle style={{ color: '#4caf50', marginRight: '5px' }} />
                Editing mode active
              </Typography>
            )}
          </Box>
          <Tooltip title={isEditable ? "Exit edit mode and return to read-only view" : "Click to edit this lead"}>
            <FormControlLabel
              control={
                <Switch 
                  checked={isEditable}
                  onChange={toggleEditMode}
                  color="primary"
                />
              }
              label={isEditable ? "Edit Mode" : "Read-only"}
              labelPlacement="start"
              sx={{ m: 0 }} // Remove default margin
            />
          </Tooltip>
        </Paper>
      </Box>
      <Box >
        <form onSubmit={handleSubmit}>
          <div style={{ padding: '10px' }}>
            <div className='leadContainer'>
              <Accordion defaultExpanded style={{ width: '98%' }}>
                <AccordionSummary expandIcon={<FiChevronDown style={{ fontSize: '25px' }} />}>
                  <Typography className='accordion-header'>Lead Information</Typography>
                </AccordionSummary>
                <Divider className='divider' />
                <AccordionDetails>
                  <Box
                    sx={{ width: '98%', color: '#1A3353', mb: 1 }}
                    component='form'
                    noValidate
                    autoComplete='off'
                  >
                    <div className='fieldContainer2'>
                      <div className='fieldSubContainer'>
                        <div className='fieldTitle'>Lead Title <span style={{ color: 'red' }}>*</span></div>
                        <TextField
                          name='lead_title'
                          value={formData.lead_title}
                          onChange={handleChange}
                          style={{ width: '70%', ...(isEditable ? {} : { backgroundColor: '#f5f5f5' }) }}
                          size='small'
                          helperText={errors?.title?.[0] ? errors?.title[0] : ''}
                          error={!!errors?.title?.[0]}
                          required
                          inputProps={{ readOnly: !isEditable }}
                        />
                      </div>
                      <div className='fieldSubContainer'>
                        <div className='fieldTitle'>Assign To <span style={{ color: 'red' }}>*</span></div>
                        <FormControl sx={{ width: '70%' }}>
                          <Autocomplete
                            id="assign-to-select"
                            options={userOptions}
                            loading={userLoading}
                            value={selectedUsers.length > 0 ? selectedUsers[0] : null}
                            onChange={(event, newValue) => {
                              if (!isEditable) return;
                              setSelectedUsers(newValue ? [newValue] : []);
                              // Use the top-level profile ID, not the user_details.id
                              setFormData({
                                ...formData,
                                assigned_to: newValue ? newValue.id : ''
                              });
                              
                              // Clear error message if a valid selection is made
                              if (newValue && errors.assigned_to) {
                                setErrors(prev => {
                                  const newErrors = { ...prev };
                                  delete newErrors.assigned_to;
                                  return newErrors;
                                });
                              }
                            }}
                            onInputChange={(event, newInputValue) => {
                              if (!isEditable) return;
                              setUserSearchTerm(newInputValue);
                            }}
                            getOptionLabel={(option) => {
                              // Get the name from user_details if available, otherwise fall back to old properties
                              const firstName = option.user_details?.first_name || option.user__first_name || '';
                              const lastName = option.user_details?.last_name || option.user__last_name || '';
                              return `${firstName} ${lastName}`.trim() || option.user__email || '';
                            }}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                size="small"
                                placeholder="Search users..."
                                error={!!errors?.assigned_to?.[0]}
                                helperText={errors?.assigned_to?.[0] || ''}
                                sx={isEditable ? {} : { backgroundColor: '#f5f5f5' }}
                                InputProps={{
                                  ...params.InputProps,
                                  readOnly: !isEditable,
                                  endAdornment: (
                                    <>
                                      {userLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                      {params.InputProps.endAdornment}
                                    </>
                                  ),
                                }}
                              />
                            )}
                            renderOption={(props, option) => {
                              // Get the name and email from user_details if available, otherwise fall back to old properties
                              const firstName = option.user_details?.first_name || option.user__first_name || '';
                              const lastName = option.user_details?.last_name || option.user__last_name || '';
                              const email = option.user_details?.email || option.user__email || '';
                              
                              return (
                                <li {...props}>
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <Avatar sx={{ bgcolor: '#284871', width: 28, height: 28, fontSize: 14 }}>
                                      {firstName.charAt(0).toUpperCase() || 'U'}
                                    </Avatar>
                                    <div>
                                      <Typography variant="body1">{`${firstName} ${lastName}`.trim()}</Typography>
                                      {email && (
                                        <Typography variant="caption" color="text.secondary">
                                          {email}
                                        </Typography>
                                      )}
                                    </div>
                                  </Stack>
                                </li>
                              );
                            }}
                            disabled={!isEditable}
                          />
                        </FormControl>
                      </div>
                    </div>
                    <div className='fieldContainer2'>
                      <div className='fieldSubContainer'>
                        <div className='fieldTitle'>Company <span style={{ color: 'red' }}>*</span></div>
                        <FormControl sx={{ width: '70%' }}>
                          <Autocomplete
                            id="company-autocomplete"
                            options={companyOptions}
                            getOptionLabel={(option) => option.name || ''}
                            value={selectedCompany}
                            onChange={(event, newValue) => {
                              if (!isEditable) return;
                              setSelectedCompany(newValue);
                              setFormData({
                                ...formData,
                                company: newValue ? newValue.id : ''
                              });
                              
                              // Clear error message if a valid selection is made
                              if (newValue && errors.company) {
                                setErrors(prev => {
                                  const newErrors = { ...prev };
                                  delete newErrors.company;
                                  return newErrors;
                                });
                              }
                            }}
                            onInputChange={(event, newInputValue) => {
                              if (!isEditable) return;
                              setCompanySearchTerm(newInputValue);
                            }}
                            loading={companyLoading}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                size="small"
                                placeholder="Search companies..."
                                error={!!errors?.company?.[0]}
                                helperText={errors?.company?.[0] || ''}
                                sx={isEditable ? {} : { backgroundColor: '#f5f5f5' }}
                                InputProps={{
                                  ...params.InputProps,
                                  readOnly: !isEditable,
                                  endAdornment: (
                                    <>
                                      {companyLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                      {params.InputProps.endAdornment}
                                    </>
                                  ),
                                }}
                              />
                            )}
                            renderOption={(props, option) => (
                             <li {...props}>
                                                             <Stack direction="row" spacing={1} alignItems="center">
                                                               <Avatar sx={{ bgcolor: '#284871', width: 28, height: 28, fontSize: 14 }}>
                                                                 {option.name?.charAt(0).toUpperCase() || 'C'}
                                                               </Avatar>
                                                               <div>
                                                                 <Typography variant="body1">{option.name}</Typography>
                                                                 {option.email && (
                                                                   <Typography variant="caption" color="text.secondary">
                                                                     {option.email}
                                                                   </Typography>
                                                                 )}
                                                               </div>
                                                             </Stack>
                                                           </li>
                            )}
                            disabled={!isEditable}
                          />
                        </FormControl>
                      </div>
                      <div className='fieldSubContainer'>
                        <div className='fieldTitle'>Contact </div>
                        <FormControl sx={{ width: '70%' }}>
                          <Autocomplete
                            id="contact-select"
                            options={contactOptions}
                            loading={contactLoading}
                            value={selectedContacts.length > 0 ? selectedContacts[0] : null}
                            onChange={(event, newValue) => {
                              if (!isEditable) return;
                              setSelectedContacts(newValue ? [newValue] : []);
                              setFormData({
                                ...formData,
                                contact: newValue ? newValue.id : ''
                              });
                              
                              // Clear error message if a valid selection is made
                              if (newValue && errors.contacts) {
                                setErrors(prev => {
                                  const newErrors = { ...prev };
                                  delete newErrors.contacts;
                                  return newErrors;
                                });
                              }
                            }}
                            onInputChange={(event, newInputValue) => {
                              if (!isEditable) return;
                              setContactSearchTerm(newInputValue);
                            }}
                            getOptionLabel={(option) => `${option.first_name} ${option.last_name}`.trim()}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                size="small"
                                placeholder={formData.company ? "Search contacts..." : "Select a company first"}
                                error={!!errors?.contacts?.[0]}
                                helperText={errors?.contacts?.[0] || ''}
                                sx={isEditable ? {} : { backgroundColor: '#f5f5f5' }}
                                InputProps={{
                                  ...params.InputProps,
                                  readOnly: !isEditable,
                                  endAdornment: (
                                    <>
                                      {contactLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                      {params.InputProps.endAdornment}
                                    </>
                                  ),
                                }}
                              />
                            )}
                            renderOption={(props, option) => (
                              <li  {...props}>
                                                              <Stack direction="row" spacing={1} alignItems="center">
                                                                <Avatar sx={{ bgcolor: '#284871', width: 28, height: 28, fontSize: 14 }}>
                                                                  {option.first_name?.charAt(0).toUpperCase() || 'C'}
                                                                </Avatar>
                                                                <div>
                                                                  <Typography variant="body1">{`${option.first_name} ${option.last_name}`.trim()}</Typography>
                                                                  {option.primary_email && (
                                                                    <Typography variant="caption" color="text.secondary">
                                                                      {option.primary_email}
                                                                    </Typography>
                                                                  )}
                                                                </div>
                                                              </Stack>
                                                            </li>
                            )}
                            disabled={!isEditable || !formData.company}                          />
                        </FormControl>
                      </div>
                    </div>
                    
                    {/* File Attachments Section */}
                    
                    
                    <div className='fieldContainer2'>
                      <div className='fieldSubContainer'>
                        <div className='fieldTitle'>Source</div>
                        <FormControl sx={{ width: '70%' }}>
                          <Select
                            name='source'
                            value={formData.source}
                            open={sourceSelectOpen && isEditable}
                            onClick={() => isEditable && setSourceSelectOpen(!sourceSelectOpen)}
                            IconComponent={() => (
                              <div onClick={() => isEditable && setSourceSelectOpen(!sourceSelectOpen)} className="select-icon-background">
                                {sourceSelectOpen ? <FiChevronUp className='select-icon' /> : <FiChevronDown className='select-icon' />}
                              </div>
                            )}
                            className={'select'}
                            onChange={handleChange}
                            error={!!errors?.lead_source?.[0] || !!errors?.source?.[0]}
                            inputProps={{ readOnly: !isEditable }}
                            sx={isEditable ? {} : { backgroundColor: '#f5f5f5' }}
                          >
                            {MOCK_SOURCES.map((option: any) => (
                              <MenuItem key={option[0]} value={option[0]}>
                                {option[1]}
                              </MenuItem>
                            ))}
                          </Select>
                          <FormHelperText>{errors?.lead_source?.[0] || errors?.source?.[0] || ''}</FormHelperText>
                        </FormControl>
                      </div>                      
                      <div className='fieldSubContainer'>
                        <div className='fieldTitle'>Tags</div>
                        <FormControl sx={{ width: '70%' }}>
                          <Select
                            name='tags'
                            value={formData.tags.length > 0 ? formData.tags[0] : ''}
                            open={tagsSelectOpen && isEditable}
                            onClick={() => isEditable && setTagsSelectOpen(!tagsSelectOpen)}
                            IconComponent={() => (
                              <div onClick={() => isEditable && setTagsSelectOpen(!tagsSelectOpen)} className="select-icon-background">
                                {tagsSelectOpen ? <FiChevronUp className='select-icon' /> : <FiChevronDown className='select-icon' />}
                              </div>
                            )}
                            className={'select'}
                            onChange={(e) => {
                              if (!isEditable) return;
                              const value = e.target.value;
                              setFormData({ ...formData, tags: value ? [value] : [] });
                            }}
                            error={!!errors?.tags?.[0]}
                            inputProps={{ readOnly: !isEditable }}
                            sx={isEditable ? {} : { backgroundColor: '#f5f5f5' }}
                          >
                            {MOCK_TAGS.map((option: string) => (
                              <MenuItem key={option} value={option}>
                                {option}
                              </MenuItem>
                            ))}
                          </Select>
                          <FormHelperText>{errors?.tags?.[0] ? errors?.tags[0] : ''}</FormHelperText>
                        </FormControl>
                      </div>
                      
                    </div>
                    <div className='fieldContainer2'>
                      <div className='fieldSubContainer'>
                        <div className='fieldTitle'>Amount</div>
                        <TextField
                          name='amount'
                          value={formData.amount}
                          onChange={handleChange}
                          style={{ width: '70%', ...(isEditable ? {} : { backgroundColor: '#f5f5f5' }) }}
                          size='small'
                          type="text"
                          placeholder="0.00"
                          onKeyDown={(e) => {
                            // Only allow if in edit mode
                            if (!isEditable) return;
                            
                            // Allow only numbers, decimal point, backspace, delete, tab, arrows
                            const allowedKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
                            const isNumber = /[0-9]/.test(e.key);
                            const isDecimal = e.key === '.';
                            const isAllowedKey = allowedKeys.includes(e.key);
                            
                            // Prevent more than one decimal point
                            if (isDecimal && String(formData.amount).includes('.')) {
                              e.preventDefault();
                              return;
                            }
                            
                            // Prevent input if not a number, decimal, or allowed key
                            if (!isNumber && !isDecimal && !isAllowedKey) {
                              e.preventDefault();
                            }
                          }}
                          
                          helperText={errors?.amount?.[0] ? errors?.amount[0] : ''}
                          error={!!errors?.amount?.[0]}
                          inputProps={{ readOnly: !isEditable }}
                        />
                      </div>
                      
                      <div className='fieldSubContainer'>
                        <div className='fieldTitle'>Probability</div>
                        <TextField
                          name='probability'
                          value={formData.probability}
                          onChange={handleChange}
                          type="text"
                          placeholder="0-100"
                          onKeyDown={(e) => {
                            // Only allow if in edit mode
                            if (!isEditable) return;
                            
                            // Allow only numbers, backspace, delete, tab, arrows
                            const allowedKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
                            const isNumber = /[0-9]/.test(e.key);
                            const isAllowedKey = allowedKeys.includes(e.key);
                            
                            // Prevent input if not a number or allowed key
                            if (!isNumber && !isAllowedKey) {
                              e.preventDefault();
                            }
                          }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position='end'>
                                <IconButton disableFocusRipple disableTouchRipple
                                  sx={{ backgroundColor: '#d3d3d34a', width: '45px', borderRadius: '0px', mr: '-12px' }}>
                                  <FaPercent style={{ width: "12px" }} />
                                </IconButton>
                              </InputAdornment>
                            ),
                            inputProps: { min: 0, max: 100, readOnly: !isEditable } // HTML5 validation attributes
                          }}
                          style={{ width: '70%', ...(isEditable ? {} : { backgroundColor: '#f5f5f5' }) }}
                          size='small'
                          helperText={errors?.probability?.[0] ? errors?.probability[0] : ''}
                          error={!!errors?.probability?.[0]}
                        />
                      </div>
                      
                    </div>
                    <div className='fieldContainer2'>
                      <div className='fieldSubContainer'>
                        <div className='fieldTitle'>Status</div>
                        <FormControl sx={{ width: '70%' }}>
                          <Select
                            name='status'
                            value={formData.status}
                            open={statusSelectOpen && isEditable}
                            onClick={() => isEditable && setStatusSelectOpen(!statusSelectOpen)}
                            IconComponent={() => (
                              <div onClick={() => isEditable && setStatusSelectOpen(!statusSelectOpen)} className="select-icon-background">
                                {statusSelectOpen ? <FiChevronUp className='select-icon' /> : <FiChevronDown className='select-icon' />}
                              </div>
                            )}
                            className={'select'}
                            onChange={handleChange}
                            error={!!errors?.status?.[0]}
                            inputProps={{ readOnly: !isEditable }}
                            sx={isEditable ? {} : { backgroundColor: '#f5f5f5' }}
                          >
                            {MOCK_STATUS.map((option: any) => (
                              <MenuItem key={option[0]} value={option[0]}>
                                {option[1]}
                              </MenuItem>
                            ))}
                          </Select>
                          <FormHelperText>{errors?.status?.[0] ? errors?.status[0] : ''}</FormHelperText>
                        </FormControl>
                      </div>
                      <div className='fieldSubContainer'>
                        <div className='fieldTitle'>Link</div>
                        <TextField
                          name='link'
                          value={formData.link}
                          onChange={handleChange}
                          style={{ width: '70%', ...(isEditable ? {} : { backgroundColor: '#f5f5f5' }) }}
                          size='small'
                          helperText={errors?.link?.[0] ? errors?.link[0] : ''}
                          error={!!errors?.link?.[0]}
                          inputProps={{ readOnly: !isEditable }}
                          placeholder="https://example.com/document"
                        />
                      </div>
                      
                    </div>
                    <div className='fieldContainer2'>
                      <div className='fieldSubContainer' >
                        <div className='fieldTitle' >
                             Attachments
                        </div>
                       
                        {fileError && (
                          <Alert severity="error" sx={{ mb: 2 }}>
                            {fileError}
                          </Alert>
                        )}
                        <Box sx={{display:'flex',flexDirection: 'column',gap:'5px'}}><Box sx={{ 
                          border: '1px solid #e0e0e0',
                          borderRadius: '4px',
                          height: formData.lead_attachment && formData.lead_attachment.length > 0 ? 'auto' : '38px',
                          minHeight: formData.lead_attachment && formData.lead_attachment.length > 0 ? '100px' : '38px',
                          maxHeight: '150px',
                          overflowY: 'auto',
                          backgroundColor: isEditable ? 'white' : '#f5f5f5',
                          display: 'flex',
                          flexDirection: 'column',
                          p: formData.lead_attachment && formData.lead_attachment.length > 0 ? 1 : 0
                        }}>
                          {/* Show existing attachments from lead_obj */}
                          {formData.lead_attachment && formData.lead_attachment.length > 0 ? (
                            <Box sx={{ p: 1 }}>
                              {formData.lead_attachment.map((attachment: any, index: number) => {
                                // Check if we have a file_path or use the attachment_url
                                let url = attachment.file_path;
                                
                                // If file_path is encoded, decode it
                                if (url && url.startsWith('/media/https%3A')) {
                                  url = decodeURIComponent(url.replace('/media/', ''));
                                }
                                
                                return (
                                  <Box 
                                    key={attachment.id || `existing-${index}`}
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
                                        backgroundColor: '#f0f0f0'
                                      }
                                    }}
                                  >
                                    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, overflow: 'hidden' }}>
                                      <Avatar 
                                        sx={{ 
                                          mr: 1, 
                                          width: 22, 
                                          height: 22, 
                                          bgcolor: 'action.hover',
                                          fontSize: '0.75rem'
                                        }}
                                      >
                                        {getFileIcon(attachment.file_name)}
                                      </Avatar>
                                      <Link 
                                        href={url} 
                                        target="_blank" 
                                        rel="noopener"
                                        sx={{ 
                                          textDecoration: 'none', 
                                          color: 'inherit',
                                          fontSize: '0.875rem',
                                          '&:hover': {
                                            color: 'primary.main',
                                            textDecoration: 'underline'
                                          }
                                        }}
                                      >
                                        {truncateFilename(attachment.file_name || `Attachment ${index + 1}`, 25)}
                                      </Link>
                                    </Box>
                                    {isEditable && (
                                      <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => handleAttachmentDelete(attachment.id, attachment.file_name)}
                                        disabled={fileUploading}
                                        sx={{ 
                                          p: '2px', 
                                          mr: 0.5,
                                          opacity: 0.7,
                                          '&:hover': { opacity: 1 }
                                        }}
                                      >
                                        <FaTimes size={12} />
                                      </IconButton>
                                    )}
                                  </Box>
                                );
                              })}
                              
                              {/* Show temporary uploaded files that might not be reflected in lead_obj yet */}
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
                                  <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, overflow: 'hidden' }}>
                                    <Avatar sx={{ mr: 1, width: 22, height: 22, bgcolor: '#bbdefb', fontSize: '0.75rem' }}>
                                      {getFileIcon(file.name)}
                                    </Avatar>
                                    <Typography variant="body2" sx={{ fontStyle: 'italic', fontSize: '0.875rem' }}>
                                      {truncateFilename(file.name, 25)} (uploading...)
                                    </Typography>
                                  </Box>
                                  <CircularProgress size={14} sx={{ mr: 0.5 }} />
                                </Box>
                              ))}
                            </Box>
                          ) : (
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              height: '100%',
                              color: 'text.secondary',
                              fontSize: '0.875rem'
                            }}>
                              No attachments
                            </Box>
                          )}
                          
                        </Box><Box sx={{width: '100%', display: 'flex',  mt: 1,justifyContent:'space-between', alignItems: 'center'}}>
                          <Tooltip title={isEditable ? "Upload a new file attachment" : "Enable edit mode to upload files"}>
                            <span>
                              <Button 
                                size="small" 
                                color="primary" 
                                variant={isEditable ? "contained" : "outlined"}
                                startIcon={fileUploading ? <CircularProgress size={16} /> : <FaFileUpload />}
                                onClick={handleFileUploadClick}
                                disabled={!isEditable || fileUploading}
                                sx={{ 
                                  py: 0.5,
                                  opacity: isEditable ? 1 : 0.6,
                                  boxShadow: isEditable ? 2 : 0
                                }}
                              >
                                Upload
                              </Button>
                            </span>
                          </Tooltip>
                        </Box>
                        
                          </Box>
                        
                        
                        
                         
                      </div>
                      <div className='fieldSubContainer'></div>
                    </div>
                    <div className='fieldContainer2'>
                      <div className='fieldSubContainer'>
                        {/* This field was moved to another section */}
                      </div>
                    
                    </div>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </div>
            {/* Description details  */}
            <div className='leadContainer'>
              <Accordion defaultExpanded style={{ width: '98%' }}>
                <AccordionSummary expandIcon={<FiChevronDown style={{ fontSize: '25px' }} />}>
                  <Typography className='accordion-header'>Description</Typography>
                </AccordionSummary>
                <Divider className='divider' />
                <AccordionDetails>
                  <Box
                    sx={{ width: '100%', mb: 1 }}
                    component='form'
                    noValidate
                    autoComplete='off'
                  >
                    <div className='DescriptionDetail'>
                      <div className='descriptionTitle'>Description <span style={{ color: 'red' }}>*</span></div>
                      <div style={{ width: '100%', marginBottom: '3%' }}>
                        <div 
                          ref={quillRef} 
                          style={{ 
                            border: errors?.description ? '1px solid red' : undefined,
                            backgroundColor: !isEditable ? '#f5f5f5' : undefined
                          }} 
                        />
                        {errors?.description && (
                          <FormHelperText error>{errors.description[0]}</FormHelperText>
                        )}
                      </div>
                    </div>
                    {isEditable && (
                      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', mt: 1.5 }}>                          <Button
                          className='header-button'
                          onClick={resetQuillToInitialState}
                          size='small'
                          variant='contained'
                          startIcon={<FaTimesCircle style={{ fill: 'white', width: '16px', marginLeft: '2px' }} />}
                          sx={{ backgroundColor: '#2b5075', ':hover': { backgroundColor: '#1e3750' } }}
                          disabled={!isEditable}
                        >
                          Reset
                        </Button>
                        <Button
                          className='header-button'
                          onClick={() => {
                            if (!isEditable) return;
                            if (quillRef.current && quillRef.current.firstChild) {
                              const content = quillRef.current.firstChild.innerHTML;
                              setFormData({ ...formData, description: content });
                              // Clear description error if content is now valid
                              if (content && content !== '<p><br></p>') {
                                setErrors(prev => {
                                  const newErrors = { ...prev };
                                  delete newErrors.description;
                                  return newErrors;
                                });
                              }
                            }
                          }}
                          variant='contained'
                          size='small'
                          startIcon={<FaCheckCircle style={{ fill: 'white', width: '16px', marginLeft: '2px' }} />}
                          sx={{ ml: 1 }}
                          disabled={!isEditable}
                        >
                          Save
                        </Button>
                      </Box>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            </div>
          </div>
        </form>
      </Box>
      {/* Success message snackbar */}
      <Snackbar open={!!successMessage} autoHideDuration={6000} onClose={() => setSuccessMessage('')}>
        <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
      {/* Modals and Dialogs */}
      <DeleteModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        DeleteItem={confirmAttachmentDelete}
        modalTitle="Delete Attachment"
        modalDialog={`Are you sure you want to delete${attachmentNameToDelete ? ` "${attachmentNameToDelete}"` : ' this attachment'} from this lead?`}
      />
      
    </Box >
  )
}
