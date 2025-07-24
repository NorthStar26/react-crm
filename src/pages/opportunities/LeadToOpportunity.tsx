import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
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
  InputLabel,
  OutlinedInput,
  Stack,
} from '@mui/material';
import TextField from '@mui/material/TextField';
import PercentIcon from '@mui/icons-material/Percent';
import { useQuill } from 'react-quilljs';
import 'quill/dist/quill.snow.css';
import { LeadUrl, OpportunityUrl } from '../../services/ApiUrls';
import { fetchData } from '../../components/FetchData';
import { CustomAppBar } from '../../components/CustomAppBar';
import {
  FaCheckCircle,
  FaPlus,
  FaTimes,
  FaTimesCircle,
  FaUpload,
} from 'react-icons/fa';
import {
  CustomPopupIcon,
  RequiredSelect,
  RequiredTextField,
} from '../../styles/CssStyled';
import { FiChevronDown } from '@react-icons/all-files/fi/FiChevronDown';
import { FiChevronUp } from '@react-icons/all-files/fi/FiChevronUp';
import '../../styles/style.css';
import { UserOption } from '../../services/userService';
import Avatar from '@mui/material/Avatar';
import { AlertType, SuccessAlert } from '../../components/Button/SuccessAlert';

type FormErrors = {
  opportunity_title?: string[];
  account?: string[];
  amount?: string[];
  currency?: string[];
  stage?: string[];
  teams?: string[];
  lead_source?: string[];
  probability?: string[];
  description?: string[];
  assigned_to?: string[];
  contact_name?: string[];
  contacts?: string[];
  due_date?: string[];
  tags?: string[];
  opportunity_attachment?: string[];
  file?: string[];
  expected_close_date?: string[];
};

interface FormData {
  opportunity_title: string;
  amount: string;
  probability: number;
  description: string;
  assigned_to: string;
  lead_source: string;
  expected_close_date?: string;
}

export function LeadToOpportunity() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { quill, quillRef } = useQuill();
  const initialContentRef = useRef(null);

  const [selectedUsers, setSelectedUsers] = useState<UserOption[]>([]);

  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<FormData>({
    opportunity_title: '',
    assigned_to: '',
    description: '',
    amount: '',
    probability: 1,
    expected_close_date: '',
    lead_source: '',
  });

  // Alert states
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<AlertType>('success');

  useEffect(() => {
    setFormData({
      ...formData,
      description:
        state.leadData?.lead_obj?.description?.replace(/<[^>]+>/g, '') || '',
      amount: state.leadData?.lead_obj?.amount || '',
      probability: state.leadData?.lead_obj?.probability || 1,
      lead_source: state.leadData?.lead_obj?.lead_source?.toUpperCase() || '',
    });
    if (quill) {
      // Save the initial state (HTML content) of the Quill editor
      initialContentRef.current = quillRef.current.firstChild.innerHTML;
    }
  }, [quill]);

  const handleChange = (e: any) => {
    const { name, value, files, type, checked, id } = e.target;
    if (type === 'file') {
      setFormData({ ...formData, [name]: e.target.files?.[0] || null });
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    // Validate required fields
    const newErrors: FormErrors = {};
    if (
      !formData.opportunity_title ||
      formData.opportunity_title.trim() === ''
    ) {
      newErrors.opportunity_title = ['Opportunity title is required.'];
    }
    if (!formData.assigned_to || formData.assigned_to.trim() === '') {
      newErrors.assigned_to = ['Assigned to is required.'];
    }
    if (!formData.amount || formData.amount.trim() === '') {
      newErrors.amount = ['Amount is required.'];
    }
    if (
      !formData.probability ||
      formData.probability <= 0 ||
      formData.probability > 100
    ) {
      newErrors.probability = ['Probability is required.'];
    }
    if (
      !formData.expected_close_date ||
      formData.expected_close_date.trim() === ''
    ) {
      newErrors.expected_close_date = ['Expected close date is required.'];
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    submitForm();
  };
  const submitForm = () => {
    const Header = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('Token'),
      org: localStorage.getItem('org'),
    };
    // console.log('Form data:', formData.lead_attachment,'sfs', formData.file);
    const data = {
      name: formData.opportunity_title,
      amount: formData.amount,
      probability: formData.probability,
      description: formData.description,
      assigned_to: formData.assigned_to,
      stage: 'QUALIFICATION',
      contacts: state.leadData?.lead_obj?.contact?.id,
      lead_source: state.leadData?.lead_obj?.lead_source?.toUpperCase() || '',
      expected_revenue: (
        parseFloat(formData.amount) *
        (formData.probability / 100)
      ).toFixed(2),
      expected_close_date: formData.expected_close_date,
      lead: state.leadData?.lead_obj?.id,
    };

    fetchData(`${OpportunityUrl}/`, 'POST', JSON.stringify(data), Header)
      .then((res) => {
        if (!res.error) {
          // Convert lead status to 'converted'
          //   "Missing required fields: contact, company, description, status, assigned_to"
          fetchData(
            `${LeadUrl}/${state.leadData?.lead_obj?.id}/`,
            'PUT',
            JSON.stringify({
              converted: true,
              status: 'qualified',
              assigned_to: formData.assigned_to,
              contact: state.leadData?.lead_obj?.contact?.id,
              company: state.leadData?.lead_obj?.company?.id,
              description: state.leadData?.lead_obj?.description,
              probability: formData.probability,
            }),
            Header
          )
            .then((leadRes) => {})
            .catch((err) => {
              console.error('Error converting lead:', err);
              setAlertMessage('An error occurred while converting the lead.');
              setAlertType('error');
              setAlertOpen(true);
            });

          // Show success alert
          setAlertMessage('Opportunity created successfully.');
          setAlertType('success');
          setAlertOpen(true);

          setTimeout(() => {
            resetForm();
            navigate('/app/opportunities');
          }, 2000);
        }
      })
      .catch((err) => {
        console.error('Error submitting form:', err);
        // Show error alert
        setAlertMessage('An error occurred while creating the opportunity.');
        setAlertType('error');
        setAlertOpen(true);
      });
  };
  const resetForm = () => {
    setFormData({
      opportunity_title: '',
      amount: '',
      probability: 1,
      description: '',
      assigned_to: '',
      lead_source: '',
    });
    setErrors({});
  };
  const onCancel = () => {
    resetForm();
  };
  const backbtnHandle = () => {
    navigate('/app/opportunities');
  };

  const module = 'Opportunities';
  const crntPage = 'Add Opportunity';
  const backBtn = 'Back To Opportunities';

  // Handler for closing the alert
  const handleAlertClose = () => {
    setAlertOpen(false);
  };

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
      {/* Success/Error Alert for attachments */}
      <SuccessAlert
        open={alertOpen}
        message={alertMessage}
        onClose={handleAlertClose}
        type={alertType}
        autoHideDuration={4000}
        showCloseButton={true}
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
                    Basic Information
                  </Typography>
                </AccordionSummary>
                <Divider className="divider" />
                <AccordionDetails>
                  <Box sx={{ width: '98%', color: '#1A3353', mb: 1 }}>
                    <div className="fieldContainer">
                      <div className="fieldSubContainer">
                        <div className="fieldTitle">Opportunity Title</div>
                        <RequiredTextField
                          name="opportunity_title"
                          value={formData.opportunity_title}
                          onChange={handleChange}
                          style={{ width: '70%' }}
                          size="small"
                          helperText={
                            errors?.opportunity_title?.[0]
                              ? errors?.opportunity_title[0]
                              : ''
                          }
                          error={!!errors?.opportunity_title?.[0]}
                        />
                      </div>
                      <div className="fieldSubContainer">
                        <div className="fieldTitle">Assign To</div>
                        <FormControl sx={{ width: '70%' }}>
                          <Autocomplete
                            // Remove multiple selection since API expects a single user
                            id="assign-to-select"
                            options={state?.leadData?.users || []}
                            value={
                              selectedUsers.length > 0 ? selectedUsers[0] : null
                            }
                            onChange={(event, newValue) => {
                              setSelectedUsers(newValue ? [newValue] : []);
                              // Use the top-level profile ID, not the user_details.id
                              setFormData({
                                ...formData,
                                assigned_to: newValue?.id || '',
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
                            // onInputChange={(event, newInputValue) => {
                            //   setUserSearchTerm(newInputValue);
                            // }}
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
                                // InputProps={{
                                //   ...params.InputProps,
                                //   endAdornment: (
                                //     <>
                                //       {userLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                //       {params.InputProps.endAdornment}
                                //     </>
                                //   ),
                                // }}
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
                        <div className="fieldTitle">Company</div>
                        <RequiredTextField
                          name="company"
                          value={state.leadData?.lead_obj?.company?.name || ''}
                          onChange={handleChange}
                          style={{ width: '70%' }}
                          size="small"
                          disabled
                        />
                      </div>
                      <div className="fieldSubContainer">
                        <div className="fieldTitle">Contact</div>
                        <RequiredTextField
                          name="first_name"
                          value={
                            state.leadData?.lead_obj?.contact?.first_name || ''
                          }
                          onChange={handleChange}
                          style={{ width: '70%' }}
                          size="small"
                          disabled
                        />
                      </div>
                    </div>
                    <div className="fieldContainer2">
                      <div
                        style={{
                          width: '40%',
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        <div
                          className="fieldSubContainer"
                          style={{ width: '100%' }}
                        >
                          <div className="fieldTitle">Stage</div>
                          <RequiredTextField
                            name="stage"
                            value={'Qualification'}
                            onChange={handleChange}
                            style={{ width: '70%' }}
                            size="small"
                            helperText={
                              errors?.stage?.[0] ? errors?.stage[0] : ''
                            }
                            error={!!errors?.stage?.[0]}
                            disabled
                          />
                        </div>
                        <div
                          className="fieldSubContainer"
                          style={{ width: '100%' }}
                        >
                          <div className="fieldTitle">Lead Source</div>
                          <RequiredTextField
                            name="lead_source"
                            value={
                              String(
                                state.leadData?.lead_obj?.lead_source[0]
                              ).toUpperCase() +
                                String(
                                  state.leadData?.lead_obj?.lead_source
                                ).slice(1) || ''
                            }
                            onChange={handleChange}
                            style={{
                              width: '70%',
                            }}
                            size="small"
                            helperText={
                              errors?.lead_source?.[0]
                                ? errors?.lead_source[0]
                                : ''
                            }
                            error={!!errors?.lead_source?.[0]}
                            disabled
                          />
                        </div>
                      </div>

                      <div className="fieldSubContainer">
                        <div className="fieldTitle">Description</div>
                        <TextareaAutosize
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          style={{ width: '70%' }}
                          minRows={6}
                          maxRows={10}
                          placeholder="Enter description"
                        />
                      </div>
                    </div>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </div>
            {/* Financial Information details  */}
            <div className="leadContainer">
              <Accordion defaultExpanded style={{ width: '98%' }}>
                <AccordionSummary
                  expandIcon={<FiChevronDown style={{ fontSize: '25px' }} />}
                >
                  <Typography className="accordion-header">
                    Financial Information
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
                    <div
                      className="fieldContainer2"
                      style={{
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div
                        className="fieldSubContainer"
                        style={{ width: '30%' }}
                      >
                        <div className="fieldTitle">Amount</div>
                        <RequiredTextField
                          name="amount"
                          value={formData.amount}
                          onChange={handleChange}
                          style={{ width: '70%' }}
                          size="small"
                          helperText={
                            errors?.amount?.[0] ? errors?.amount[0] : ''
                          }
                          error={!!errors?.amount?.[0]}
                          type="number"
                        />
                      </div>
                      <div
                        className="fieldSubContainer"
                        style={{ width: '30%' }}
                      >
                        <div className="fieldTitle">Probability</div>
                        <TextField
                          name="probability"
                          value={formData.probability}
                          onChange={handleChange}
                          style={{ width: '70%' }}
                          size="small"
                          helperText={
                            errors?.probability?.[0]
                              ? errors?.probability[0]
                              : ''
                          }
                          error={!!errors?.probability?.[0]}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <PercentIcon color="disabled" />
                              </InputAdornment>
                            ),
                          }}
                          type="number"
                        />
                      </div>
                      <div
                        className="fieldSubContainer"
                        style={{ width: '30%' }}
                      >
                        <div className="fieldTitle">Expected Revenue</div>
                        <TextField
                          name="expected_revenue"
                          value={
                            formData.amount && formData.probability
                              ? (
                                  parseFloat(formData.amount) *
                                  (formData.probability / 100)
                                ).toFixed(2)
                              : ''
                          }
                          onChange={handleChange}
                          style={{ width: '70%' }}
                          size="small"
                          type="number"
                          disabled
                          variant="filled"
                        />
                      </div>
                      <div
                        className="fieldSubContainer"
                        style={{ width: '30%' }}
                      >
                        <div className="fieldTitle">Expected Close Date</div>
                        <TextField
                          name="expected_close_date"
                          value={formData.expected_close_date}
                          onChange={handleChange}
                          style={{ width: '70%' }}
                          size="small"
                          type="date"
                          error={!!errors?.expected_close_date?.[0]}
                          helperText={
                            errors?.expected_close_date?.[0]
                              ? errors?.expected_close_date[0]
                              : ''
                          }
                        />
                      </div>
                    </div>
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
