import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  CircularProgress
} from '@mui/material'
import { useQuill } from 'react-quilljs';
import 'quill/dist/quill.snow.css';
import '../../styles/style.css'
import { LeadUrl } from '../../services/ApiUrls'
import { fetchData, Header } from '../../components/FetchData'
import { fetchCompanyOptions, CompanyOption } from '../../services/companyService'
import { fetchContactOptions, ContactOption } from '../../services/contactService'
import { useDebounce } from '../../hooks/useDebounce'
import { CustomAppBar } from '../../components/CustomAppBar'
import { FaArrowDown, FaCheckCircle, FaFileUpload, FaPalette, FaPercent, FaPlus, FaTimes, FaTimesCircle, FaUpload } from 'react-icons/fa'
import { useForm } from '../../components/UseForm'
import { CustomPopupIcon, CustomSelectField, RequiredTextField, StyledSelect } from '../../styles/CssStyled'
import { FiChevronDown } from '@react-icons/all-files/fi/FiChevronDown'
import { FiChevronUp } from '@react-icons/all-files/fi/FiChevronUp'

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
const MOCK_USERS: User[] = [
  { id: 'user1', user__email: 'john.doe@example.com', username: 'John Doe' },
  { id: 'user2', user__email: 'jane.smith@example.com', username: 'Jane Smith' },
  { id: 'user3', user__email: 'michael.johnson@example.com', username: 'Michael Johnson' },
  { id: 'user4', user__email: 'sarah.williams@example.com', username: 'Sarah Williams' },
  { id: 'user5', user__email: 'david.brown@example.com', username: 'David Brown' }
];
const MOCK_TAGS: string[] = ['Important', 'Urgent', 'Follow-up', 'New'];
// MOCK_CONTACT_OPTIONS removed as we're now using real data from the API
// MOCK_COMPANIES removed as we're now using real data from the API
const MOCK_STATUS: [string, string][] = [
  ['open', 'Open'],
  ['closed', 'Closed'],
  ['assigned', 'Assigned']
];
const MOCK_SOURCES: [string, string][] = [
  ['call', 'Call'],
  ['email', 'Email'],
  ['web', 'Web'],
  ['referral', 'Referral']
];

// const useStyles = makeStyles({
//   btnIcon: {
//     height: '14px',
//     color: '#5B5C63'
//   },
//   breadcrumbs: {
//     color: 'white'
//   },
//   fields: {
//     height: '5px'
//   },
//   chipStyle: {
//     backgroundColor: 'red'
//   },
//   icon: {
//     '&.MuiChip-deleteIcon': {
//       color: 'darkgray'
//     }
//   }
// })

// const textFieldStyled = makeStyles(() => ({
//   root: {
//     borderLeft: '2px solid red',
//     height: '35px'
//   },
//   fieldHeight: {
//     height: '35px'
//   }
// }))

// function getStyles (name, personName, theme) {
//   return {
//     fontWeight:
//       theme.typography.fontWeightRegular
//   }
// }

type FormErrors = {
  lead_attachment?: string[],
  opportunity_amount?: string[],
  description?: string[],
  assigned_to?: string[],
  contacts?: string[],
  status?: string[],
  source?: string[],
  tags?: string[],
  company?: string[],
  probability?: number[],
  file?: string[],
  link?: string[],
  title?: string[],
};
interface FormData {
  // Main lead fields
  title: string,
  opportunity_amount: string,
  description: string,
  assigned_to: string[],
  contacts: string[],
  status: string,
  source: string,
  tags: string[],
  company: string,
  probability: number,
  lead_attachment: string | null,
  file: string | null,
  link: string
}

export function AddLeads() {
  const navigate = useNavigate()
  const { quill, quillRef } = useQuill();
  const initialContentRef = useRef(null);

  const autocompleteRef = useRef<any>(null);
  const [error, setError] = useState(false)
  const [sourceSelectOpen, setSourceSelectOpen] = useState(false)
  const [statusSelectOpen, setStatusSelectOpen] = useState(false)
  const [companySelectOpen, setCompanySelectOpen] = useState(false)
  const [contactSelectOpen, setContactSelectOpen] = useState(false)
  const [assignToSelectOpen, setAssignToSelectOpen] = useState(false)
  const [tagsSelectOpen, setTagsSelectOpen] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<FormData>({
    title: '',
    lead_attachment: null,
    opportunity_amount: '',
    description: '',
    assigned_to: [],
    contacts: [],
    status: 'assigned',
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
  
  // Debounce search terms to prevent excessive API calls
  const debouncedCompanySearch = useDebounce(companySearchTerm, 400);
  const debouncedContactSearch = useDebounce(contactSearchTerm, 400);

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
        const company = result.options.find(option => option.id === formData.company);
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
  
  // Update selected contacts whenever formData.contacts changes
  useEffect(() => {
    if (formData.contacts.length > 0 && selectedContacts.length === 0) {
      const fetchSelectedContacts = async () => {
        // Fetch all contacts for the selected company (we'll filter them on the client side)
        const result = await fetchContactOptions('', formData.company, 100);
        
        if (result.options) {
          // Find all contacts that match the IDs in formData.contacts
          const selected = result.options.filter(contact => 
            formData.contacts.includes(contact.id)
          );
          
          if (selected.length > 0) {
            setSelectedContacts(selected);
          }
        }
      };
      
      fetchSelectedContacts();
    }
  }, [formData.contacts, selectedContacts, formData.company]);
  
  // Reset contacts when company changes
  useEffect(() => {
    const prevCompany = formData.company;
    
    // If company has changed, clear selected contacts
    if (prevCompany && prevCompany !== formData.company) {
      setFormData(prev => ({
        ...prev,
        contacts: []
      }));
      setSelectedContacts([]);
      setContactSearchTerm('');
    }
  }, [formData.company]);

  // No longer need handleChange2 as we're using Select dropdowns for all fields

  const handleChange = (e: any) => {
    // const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    // console.log('e.target',e)
    const { name, value, files, type, checked, id } = e.target;
    // console.log('auto', val)
    if (type === 'file') {
      setFormData({ ...formData, [name]: e.target.files?.[0] || null });
    }
    else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    }
    else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        // setFormData({ ...formData, lead_attachment: reader.result as string });
        setFormData({ ...formData, file: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const resetQuillToInitialState = () => {
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
    // console.log('Form data:', formData.lead_attachment,'sfs', formData.file);
    const data = {
      title: formData.title,
      lead_attachment: formData.file,
      opportunity_amount: formData.opportunity_amount,
      description: formData.description,
      assigned_to: formData.assigned_to,
      contacts: formData.contacts,
      status: formData.status,
      source: formData.source,
      tags: formData.tags,
      company: formData.company,
      probability: formData.probability,
      link: formData.link
    }

    // Making a direct POST request to LeadUrl, independent from other pages
    fetchData(`${LeadUrl}/`, 'POST', JSON.stringify(data), Header)
      .then((res: any) => {
        console.log('Lead created successfully:', res);
        if (!res.error) {
          resetForm()
          navigate('/app/leads')
        }
        if (res.error) {
          setError(true)
          setErrors(res?.errors)
        }
      })
      .catch((error) => {
        console.error('Error creating lead:', error);
        setError(true);
      })
  };

  const resetForm = () => {
    setFormData({
      title: '',
      lead_attachment: null,
      opportunity_amount: '',
      description: '',
      assigned_to: [],
      contacts: [],
      status: 'assigned',
      source: 'call',
      tags: [],
      company: '',
      probability: 1,
      file: null,
      link: ''
    });
    setErrors({});
    setSelectedCompany(null);
    setCompanySearchTerm('');
    setSelectedContacts([]);
    setContactSearchTerm('');
    setContactOptions([]);
    // No longer need to reset selectedAssignTo and selectedTags as we're using direct state in formData
    // if (autocompleteRef.current) {
    //   console.log(autocompleteRef.current,'ccc')
    //   autocompleteRef.current.defaultValue([]);
    // }
  }
  const onCancel = () => {
    resetForm()
  }

  const backbtnHandle = () => {
    navigate('/app/leads')
  }

  const module = 'Leads'
  const crntPage = 'Add Leads'
  const backBtn = 'Back To Leads'

  // console.log(state, 'leadsform')
  return (
    <Box sx={{ mt: '60px' }}>
      <CustomAppBar backbtnHandle={backbtnHandle} module={module} backBtn={backBtn} crntPage={crntPage} onCancel={onCancel} onSubmit={handleSubmit} />
      <Box sx={{ mt: "120px" }}>
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
                        <div className='fieldTitle'>Lead Title</div>
                        <TextField
                          name='title'
                          value={formData.title}
                          onChange={handleChange}
                          style={{ width: '70%' }}
                          size='small'
                          helperText={errors?.title?.[0] ? errors?.title[0] : ''}
                          error={!!errors?.title?.[0]}
                        />
                      </div>
                      <div className='fieldSubContainer'>
                        <div className='fieldTitle'>Assign To</div>
                        <FormControl sx={{ width: '70%' }}>
                          <Select
                            name='assigned_to'
                            value={formData.assigned_to.length > 0 ? formData.assigned_to[0] : ''}
                            open={assignToSelectOpen}
                            onClick={() => setAssignToSelectOpen(!assignToSelectOpen)}
                            IconComponent={() => (
                              <div onClick={() => setAssignToSelectOpen(!assignToSelectOpen)} className="select-icon-background">
                                {assignToSelectOpen ? <FiChevronUp className='select-icon' /> : <FiChevronDown className='select-icon' />}
                              </div>
                            )}
                            className={'select'}
                            onChange={(e) => {
                              const value = e.target.value;
                              setFormData({ ...formData, assigned_to: value ? [value] : [] });
                            }}
                            error={!!errors?.assigned_to?.[0]}
                          >
                            {MOCK_USERS.map((option: any) => (
                              <MenuItem key={option.id} value={option.id}>
                                {option.user__email || option.username}
                              </MenuItem>
                            ))}
                          </Select>
                          <FormHelperText>{errors?.assigned_to?.[0] ? errors?.assigned_to[0] : ''}</FormHelperText>
                        </FormControl>
                      </div>
                    </div>
                    <div className='fieldContainer2'>
                      <div className='fieldSubContainer'>
                        <div className='fieldTitle'>Company</div>
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
                                company: newValue ? newValue.id : ''
                              });
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
                          />
                        </FormControl>
                      </div>
                      <div className='fieldSubContainer'>
                        <div className='fieldTitle'>Contact</div>
                        <FormControl sx={{ width: '70%' }}>
                          <Autocomplete
                            multiple
                            id="contacts-select"
                            options={contactOptions}
                            loading={contactLoading}
                            value={selectedContacts}
                            onChange={(event, newValue) => {
                              setSelectedContacts(newValue);
                              setFormData({
                                ...formData,
                                contacts: newValue.map(contact => contact.id)
                              });
                            }}
                            onInputChange={(event, newInputValue) => {
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
                                InputProps={{
                                  ...params.InputProps,
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
                              <li {...props}>
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
                            disabled={!formData.company} // Disable if no company is selected
                          />
                        </FormControl>
                      </div>
                    </div>
                    <div className='fieldContainer2'>
                      <div className='fieldSubContainer'>
                        <div className='fieldTitle'>Source</div>
                        <FormControl sx={{ width: '70%' }}>
                          <Select
                            name='source'
                            value={formData.source}
                            open={sourceSelectOpen}
                            onClick={() => setSourceSelectOpen(!sourceSelectOpen)}
                            IconComponent={() => (
                              <div onClick={() => setSourceSelectOpen(!sourceSelectOpen)} className="select-icon-background">
                                {sourceSelectOpen ? <FiChevronUp className='select-icon' /> : <FiChevronDown className='select-icon' />}
                              </div>
                            )}
                            className={'select'}
                            onChange={handleChange}
                            error={!!errors?.source?.[0]}
                          >
                            {MOCK_SOURCES.map((option: any) => (
                              <MenuItem key={option[0]} value={option[0]}>
                                {option[1]}
                              </MenuItem>
                            ))}
                          </Select>
                          <FormHelperText>{errors?.source?.[0] ? errors?.source[0] : ''}</FormHelperText>
                        </FormControl>
                      </div>                      <div className='fieldSubContainer'>
                        <div className='fieldTitle'>Tags</div>
                        <FormControl sx={{ width: '70%' }}>
                          <Select
                            name='tags'
                            value={formData.tags.length > 0 ? formData.tags[0] : ''}
                            open={tagsSelectOpen}
                            onClick={() => setTagsSelectOpen(!tagsSelectOpen)}
                            IconComponent={() => (
                              <div onClick={() => setTagsSelectOpen(!tagsSelectOpen)} className="select-icon-background">
                                {tagsSelectOpen ? <FiChevronUp className='select-icon' /> : <FiChevronDown className='select-icon' />}
                              </div>
                            )}
                            className={'select'}
                            onChange={(e) => {
                              const value = e.target.value;
                              setFormData({ ...formData, tags: value ? [value] : [] });
                            }}
                            error={!!errors?.tags?.[0]}
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
                    <div className='fieldContainer2'><div className='fieldSubContainer'>
                        <div className='fieldTitle'>Amount</div>
                        <TextField
                          name='opportunity_amount'
                          value={formData.opportunity_amount}
                          onChange={handleChange}
                          style={{ width: '70%' }}
                          size='small'
                          helperText={errors?.opportunity_amount?.[0] ? errors?.opportunity_amount[0] : ''}
                          error={!!errors?.opportunity_amount?.[0]}
                        />
                      </div>
                      
                      <div className='fieldSubContainer'>
                        <div className='fieldTitle'>Probability</div>
                        <TextField
                          name='probability'
                          value={formData.probability}
                          onChange={handleChange}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position='end'>
                                <IconButton disableFocusRipple disableTouchRipple
                                  sx={{ backgroundColor: '#d3d3d34a', width: '45px', borderRadius: '0px', mr: '-12px' }}>
                                  <FaPercent style={{ width: "12px" }} />
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                          style={{ width: '70%' }}
                          size='small'
                          helperText={errors?.probability?.[0] ? errors?.probability[0] : ''}
                          error={!!errors?.probability?.[0]}
                        />
                      </div>
                      
                    </div>
                    <div className='fieldContainer2'><div className='fieldSubContainer'>
                        <div className='fieldTitle'>Lead Attachment</div>
                        <TextField
                          name='lead_attachment'
                          value={formData.lead_attachment}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position='end'>
                                <IconButton disableFocusRipple
                                  disableTouchRipple
                                  sx={{ width: '40px', height: '40px', backgroundColor: 'whitesmoke', borderRadius: '0px', mr: '-13px', cursor: 'pointer' }}
                                >
                                  <label htmlFor='icon-button-file'>
                                    <input
                                      hidden
                                      accept='image/*'
                                      id='icon-button-file'
                                      type='file'
                                      name='account_attachment'
                                      onChange={(e: any) => {
                                        //  handleChange(e); 
                                        handleFileChange(e)
                                      }}
                                    />
                                    <FaUpload color='primary' style={{ fontSize: '15px', cursor: 'pointer' }} />
                                  </label>
                                </IconButton>
                              </InputAdornment>
                            )
                          }}
                          sx={{ width: '70%' }}
                          size='small'
                          helperText={errors?.lead_attachment?.[0] ? errors?.lead_attachment[0] : ''}
                          error={!!errors?.lead_attachment?.[0]}
                        />
                      </div>
                      <div className='fieldSubContainer'>
                        <div className='fieldTitle'>Link</div>
                        <TextField
                          name='link'
                          value={formData.link}
                          onChange={handleChange}
                          style={{ width: '70%' }}
                          size='small'
                          helperText={errors?.link?.[0] ? errors?.link[0] : ''}
                          error={!!errors?.link?.[0]}
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
                            open={statusSelectOpen}
                            onClick={() => setStatusSelectOpen(!statusSelectOpen)}
                            IconComponent={() => (
                              <div onClick={() => setStatusSelectOpen(!statusSelectOpen)} className="select-icon-background">
                                {statusSelectOpen ? <FiChevronUp className='select-icon' /> : <FiChevronDown className='select-icon' />}
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
                          <FormHelperText>{errors?.status?.[0] ? errors?.status[0] : ''}</FormHelperText>
                        </FormControl>
                      </div>
                      <div className='fieldSubContainer'>
                        {/* Empty container for layout balance */}
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
                      <div className='descriptionTitle'>Description</div>
                      <div style={{ width: '100%', marginBottom: '3%' }}>
                        <div ref={quillRef} />
                      </div>
                    </div>
                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', mt: 1.5 }}>
                      <Button
                        className='header-button'
                        onClick={resetQuillToInitialState}
                        size='small'
                        variant='contained'
                        startIcon={<FaTimesCircle style={{ fill: 'white', width: '16px', marginLeft: '2px' }} />}
                        sx={{ backgroundColor: '#2b5075', ':hover': { backgroundColor: '#1e3750' } }}
                      >
                        Cancel
                      </Button>
                      <Button
                        className='header-button'
                        onClick={() => setFormData({ ...formData, description: quillRef.current.firstChild.innerHTML })}
                        variant='contained'
                        size='small'
                        startIcon={<FaCheckCircle style={{ fill: 'white', width: '16px', marginLeft: '2px' }} />}
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
    </Box >
  )
}
