import React, { ChangeEvent, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  TextField,
  AccordionDetails,
  Accordion,
  AccordionSummary,
  Typography,
  Box,
  TextareaAutosize,
  MenuItem,
  Tooltip,
  Button,
  Input,
  Avatar,
  IconButton,
  Stack,
  Divider,
  Select,
  FormControl,
  FormHelperText,
} from '@mui/material';
// import { makeStyles } from '@mui/styles'
// import isEmail from 'validator/lib/isEmail'
import {  isValidPhoneNumber } from 'libphonenumber-js';

import '../../styles/style.css';
import { UsersUrl } from '../../services/ApiUrls';
import { fetchData, Header } from '../../components/FetchData';
import { CustomAppBar } from '../../components/CustomAppBar';
import {
  FaArrowAltCircleDown,
  FaArrowDown,
  FaTimes,
  FaUpload,
} from 'react-icons/fa';
import {
  AntSwitch,
  CustomSelectField,
  CustomSelectTextField,
  RequiredTextField,
} from '../../styles/CssStyled';
import { FiChevronDown } from '@react-icons/all-files/fi/FiChevronDown';
import { FiChevronUp } from '@react-icons/all-files/fi/FiChevronUp';
import { COUNTRIES } from '../../data/countries';


type FormErrors = {
  email?: string[];
  role?: string[];
  phone?: string[];
  alternate_phone?: string[];
  address_line?: string[];
  street?: string[];
  city?: string[];
  state?: string[];
  postcode?: string[];
  country?: string[];
  profile_pic?: string[];
  has_sales_access?: string[];
  has_marketing_access?: string[];
  is_organization_admin?: string[];
};
interface FormData {
  email: string;
  role: string;
  phone: string;
  alternate_phone: string;
  address_line: string;
  street: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  profile_pic: string | null;
  has_sales_access: boolean;
  has_marketing_access: boolean;
  is_organization_admin: boolean;
}
export function AddUsers() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [roleSelectOpen, setRoleSelectOpen] = useState(false);
  const [countrySelectOpen, setCountrySelectOpen] = useState(false);
  const [error, setError] = useState(false);
  const [msg, setMsg] = useState('');
  const [responceError, setResponceError] = useState(false);
  const handleChange = (e: any) => {
    const { name, value, files, type, checked } = e.target;
    
    // Clear errors for the specific field being changed
    if (profileErrors[name as keyof FormErrors]) {
      setProfileErrors({ ...profileErrors, [name]: undefined });
    }
    if (userErrors[name as keyof FormErrors]) {
      setUserErrors({ ...userErrors, [name]: undefined });
    }
    
    if (type === 'file') {
      setFormData({ ...formData, [name]: e.target.files?.[0] || null });
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

    const backbtnHandle = () => {
        navigate('/app/users')
    }
    // const handleSubmit = (e: any) => {
    //     e.preventDefault();
    //     submitForm();
    // }
    const validateForm = () => {
        const errors: Partial<FormData> = {};

        if (!formData.email) errors.email = 'Email is required.';
        if (!formData.phone) errors.phone = 'Phone is required.';


        return Object.keys(errors).length === 0 ? null : errors;
    };

    const handleSubmit = (e: any) => {
        e.preventDefault();

        const validationErrors = validateForm();
        if (validationErrors) {
            setUserErrors(validationErrors);
            return;
        }

        submitForm();
    };
    const [errors, setErrors] = useState<FormErrors>({});
    const [profileErrors, setProfileErrors] = useState<FormErrors>({});
    const [userErrors, setUserErrors] = useState<any>({});
    const [formData, setFormData] = useState<FormData>({
        email: '',
        role: 'ADMIN',
        phone: '',
        alternate_phone: '',
        address_line: '',
        street: '',
        city: '',
        state: '',
        postcode: '',
        country: '',
        profile_pic: null,
        has_sales_access: false,
        has_marketing_access: false,
        is_organization_admin: false

    })

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData({ ...formData, profile_pic: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

    const submitForm = () => {
        const Header = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('Token'),
            org: localStorage.getItem('org')
        }
        // console.log('Form data:', data);

    const data = {
      email: formData.email,
      role: formData.role,
      phone: formData.phone,
      alternate_phone: formData.alternate_phone,
      address_line: formData.address_line,
      street: formData.street,
      city: formData.city,
      state: formData.state,
      postcode: formData.postcode,
      country: formData.country,
      profile_pic: formData.profile_pic,
      has_sales_access: formData.has_sales_access,
      has_marketing_access: formData.has_marketing_access,
      is_organization_admin: formData.is_organization_admin,
    };    fetchData(`${UsersUrl}/`, 'POST', JSON.stringify(data), Header)
      .then((res: any) => {
        console.log('Form data:', res);
        resetForm();
        navigate('/app/users');
      })
      .catch((error: any) => {
        console.log('Error response:', error);
        if (error.status === 400 && error.data) {
          // Handle validation errors from API
          setError(true);
          setProfileErrors(error.data?.errors?.profile_errors || {});
          setUserErrors(error.data?.errors?.user_errors || {});
        } else {
          // Handle other errors
          console.error('Unexpected error:', error);
        }
      });
  };
  const resetForm = () => {
    setFormData({
      email: '',
      role: 'ADMIN',
      phone: '',
      alternate_phone: '',
      address_line: '',
      street: '',
      city: '',
      state: '',
      postcode: '',
      country: '',
      profile_pic: null,
      has_sales_access: false,
      has_marketing_access: false,
      is_organization_admin: false,
    });
    setProfileErrors({});
    setUserErrors({});
  };
  const onCancel = () => {
    resetForm();
  };
  const module = 'Users';
  const crntPage = 'Add Users';
  const backBtn = 'Back To Users';

    
    const validatePhoneNumber = (phoneNumber: string, countryCode?: string) => {
      try {
        // If no country code provided, try to validate as international format
        if (!countryCode) {
          return isValidPhoneNumber(phoneNumber);
        }
        // Validate with specific country code if provided
        return isValidPhoneNumber(phoneNumber, countryCode as any);
      } catch (error) {
        return false;
      }
    };

    // Alternative: More strict validation to match Django
    const validatePhoneNumberStrict = (phoneNumber: string) => {
      try {
        // Ensure the number starts with + (international format)
        if (!phoneNumber.startsWith('+')) {
          return false;
        }
        
        // Use parsePhoneNumber for more detailed validation
        const { parsePhoneNumber } = require('libphonenumber-js');
        const parsed = parsePhoneNumber(phoneNumber);
        
        return parsed && parsed.isValid();
      } catch (error) {
        return false;
      }
    };

    return (
        <Box sx={{ mt: '60px' }}>
            <CustomAppBar backbtnHandle={backbtnHandle} module={module} backBtn={backBtn} crntPage={crntPage} onCancel={onCancel} onSubmit={handleSubmit} />
            <Box sx={{ mt: "120px" }}>
                <form onSubmit={handleSubmit}>
                    <div style={{ padding: '10px' }}>
                        <div className='leadContainer'>
                            <Accordion defaultExpanded style={{ width: '98%' }}>
                                <AccordionSummary expandIcon={<FiChevronDown style={{ fontSize: '25px' }} />}>
                                    <Typography className='accordion-header'>User Information</Typography>
                                </AccordionSummary>
                                <Divider className='divider' />
                                <AccordionDetails>
                                    <Box
                                        sx={{ width: '98%', color: '#1A3353', mb: 1 }}
                                        component='form'
                                        noValidate
                                        autoComplete='off'
                                    >
                                        <div className='fieldContainer'>
                                            <div className='fieldSubContainer'>
                                                <div className='fieldTitle'>Email</div>
                                                <Tooltip title = 'Enter an email' >
                                                     <RequiredTextField
                                                    required
                                                    name='email'
                                                    
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    style={{ width: '70%' }}
                                                    size='small'                                                    
                                                    error={Boolean(
                                                        (Array.isArray(profileErrors?.email) ? profileErrors?.email[0] : profileErrors?.email) ||
                                                        (Array.isArray(userErrors?.email) ? userErrors?.email[0] : userErrors?.email)
                                                    )}
                                                    helperText={
                                                        (Array.isArray(profileErrors?.email) ? profileErrors?.email[0] : profileErrors?.email) ||
                                                        (Array.isArray(userErrors?.email) ? userErrors?.email[0] : userErrors?.email) ||
                                                        ''
                                                    }
                                                />
                                                </Tooltip>
                                               
                                            </div>
                                            <div className='fieldSubContainer'>
                                                <div className='fieldTitle'>Role</div>
                                                <FormControl sx={{ width: '70%' }}>
                                                    <Select
                                                        name='role'
                                                        value={formData.role}
                                                        open={roleSelectOpen}
                                                        onClick={() => setRoleSelectOpen(!roleSelectOpen)}
                                                        IconComponent={() => (
                                                            <div onClick={() => setRoleSelectOpen(!roleSelectOpen)} className="select-icon-background">
                                                                {roleSelectOpen ? <FiChevronUp className='select-icon' /> : <FiChevronDown className='select-icon' />}
                                                            </div>
                                                        )}
                                                        className={'select'}
                                                        onChange={handleChange}
                                                        error={!!errors?.role?.[0]}
                                                    >
                                                        {['ADMIN', 'USER'].map((option) => (
                                                            <MenuItem key={option} value={option}>
                                                                {option}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                    {/* <FormHelperText>{errors?.[0] ? errors[0] : ''}</FormHelperText> */}
                                                </FormControl>
                                            </div>
                                        </div>
                                        <div className='fieldContainer2'>
                                            <div className='fieldSubContainer'>
                                                <div className='fieldTitle'>Phone Number</div>
                                                <Tooltip title="Enter a phone number">
                                                    {/* <RequiredTextField
                                                        name='phone'
                                                        id='outlined-error-helper-text'
                                                        value={formData.phone}
                                                        onChange={handleChange}
                                                        required
                                                        style={{ width: '70%' }}
                                                        size='small'
                                                        error={!!profileErrors?.phone?.[0] || !!userErrors?.phone?.[0]}
                                                        helperText={profileErrors?.phone?.[0] || userErrors?.phone?.[0] || ''}
                                                    /> */}
                                                    <RequiredTextField
                                                        name="phone"
                                                        id="outlined-error-helper-text"
                                                        value={formData.phone}
                                                        onChange={handleChange}
                                                        required
                                                        style={{ width: '70%' }}
                                                        size="small"
                                                        error={
                                                            Boolean(
                                                                (Array.isArray(profileErrors?.phone) ? profileErrors?.phone[0] : profileErrors?.phone) ||
                                                                (Array.isArray(userErrors?.phone) ? userErrors?.phone[0] : userErrors?.phone) ||
                                                                (formData.phone && !validatePhoneNumber(formData.phone))
                                                            )
                                                        }
                                                        helperText={
                                                            (Array.isArray(profileErrors?.phone) ? profileErrors?.phone[0] : profileErrors?.phone) ||
                                                            (Array.isArray(userErrors?.phone) ? userErrors?.phone[0] : userErrors?.phone) ||
                                                            (formData.phone && !validatePhoneNumber(formData.phone)
                                                                ? 'Please enter a valid international phone number (e.g. +14155552671)'
                                                                : '')
                                                        }
                                                    />
                                                </Tooltip>
                                            </div>
                                            <div className='fieldSubContainer'>
                                                <div className='fieldTitle'>Alternate Phone</div>
                                                <Tooltip title="Enter a phone number">
                                                    <RequiredTextField
                                                        required
                                                        name='alternate_phone'
                                                        value={formData.alternate_phone}
                                                        onChange={handleChange}
                                                        style={{ width: '70%' }}
                                                        size='small'                                                        error={Boolean(
                                                            (Array.isArray(profileErrors?.alternate_phone) ? profileErrors?.alternate_phone[0] : profileErrors?.alternate_phone) ||
                                                            (Array.isArray(userErrors?.alternate_phone) ? userErrors?.alternate_phone[0] : userErrors?.alternate_phone) ||
                                                            (formData.alternate_phone && !validatePhoneNumber(formData.alternate_phone))
                                                        )}
                                                        helperText={
                                                            (Array.isArray(profileErrors?.alternate_phone) ? profileErrors?.alternate_phone[0] : profileErrors?.alternate_phone) ||
                                                            (Array.isArray(userErrors?.alternate_phone) ? userErrors?.alternate_phone[0] : userErrors?.alternate_phone) ||
                                                            (formData.alternate_phone && !validatePhoneNumber(formData.alternate_phone)
                                                                ? 'Please enter a valid international phone number (e.g. +14155552671)'
                                                                : '') ||
                                                            ''
                                                        }
                                                    />
                                                </Tooltip>
                                            </div>
                                        </div>
                                        {/* <div className='fieldContainer2'>
                                            <div className='fieldSubContainer'>
                                                <div className='fieldTitle'>Profile picture</div>
                                                <Stack sx={{ display: 'flex', flexDirection: 'column' }}>
                                                    <Stack sx={{ display: 'flex', flexDirection: 'row' }}>
                                                        <label htmlFor="avatar-input">
                                                            <input
                                                                id="avatar-input"
                                                                name="profile_pic"
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={(e: any) => {
                                                                    handleFileChange(e);
                                                                    handleChange(e);
                                                                }}
                                                                style={inputStyles}
                                                            />
                                                            <IconButton
                                                                component="span"
                                                                color="primary"
                                                                aria-label="upload avatar"
                                                            >
                                                                <FaUpload fill='lightgrey' />
                                                            </IconButton>
                                                        </label>
                                                        <Box>  {formData.profile_pic !== null ?
                                                            <Box sx={{ position: 'relative' }}>
                                                                <Avatar src={formData.profile_pic || ''} />
                                                                <FaTimes style={{ position: 'absolute', marginTop: '-45px', marginLeft: '25px', fill: 'lightgray', cursor: 'pointer' }}
                                                                    onClick={() => setFormData({ ...formData, profile_pic: null })} />
                                                            </Box> : ''}
                                                        </Box>
                                                        {formData.profile_pic && <Typography sx={{ color: '#d32f2f', fontSize: '12px', ml: '-70px', mt: '40px' }}>{profileErrors?.profile_pic?.[0] || userErrors?.profile_pic?.[0] || ''}</Typography>}
                                                    </Stack>
                                                </Stack>


                                                {/* <label htmlFor='icon-button-file' style={{backgroundColor:'grey'}}>
                                                    <Input
                                                        id='icon-button-file'
                                                        type='file'
                                                        // ref={inputFileRef}
                                                        sx={{
                                                            display: 'table-caption'
                                                        }}
                                                    //     onChange={handleChange}
                                                    // name='profile_pic'
                                                    />
                                                    <Button
                                                        variant='outlined'
                                                        sx={{
                                                            width: '147px',
                                                            height: '42px',
                                                            position: 'relative',
                                                            top: '-21px'
                                                        }}
                                                    // disableRipple
                                                    // disableFocusRipple
                                                    // disableTouchRipple
                                                    // onClick={() => inputFileRef.current.click()}
                                                    >
                                                    <IconButton type='file' onChange={handleChange}
                                                    name='profile_pic' >
                                                        <Avatar src={formData.profile_pic}></Avatar></IconButton>
                                                         Upload Files 
                                                     </Button> 
                                                </label> 
                                                 <TextField
                                                    type="file"
                                                    onChange={handleChange}
                                                    name='profile_pic'
                                                    style={{ width: '70%' }}
                                                    size='small'
                                                    error={!!errors.profile_pic || !!errors?.profile_pic?.[0]}
                                                    helperText={errors.profile_pic || errors?.profile_pic?.[0] || ''}
                                                /> 
                                            </div>
                                            <div className='fieldSubContainer'>
                                                <div className='fieldTitle'>Sales Access</div>
                                                <AntSwitch
                                                    name='has_sales_access'
                                                    checked={formData.has_sales_access}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>
                                        <div className='fieldContainer2'>
                                            <div className='fieldSubContainer'>
                                                <div className='fieldTitle'>Marketing Access</div>
                                                <AntSwitch
                                                    name='has_marketing_access'
                                                    checked={formData.has_marketing_access}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            <div className='fieldSubContainer'>
                                                <div className='fieldTitle'>Organization Admin</div>
                                                <AntSwitch
                                                    name='is_organization_admin'
                                                    checked={formData.is_organization_admin}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div> */}
                  </Box>
                </AccordionDetails>
              </Accordion>
            </div>
            {/* Address Details */}
            <div className="leadContainer">
              <Accordion defaultExpanded style={{ width: '98%' }}>
                <AccordionSummary
                  expandIcon={<FiChevronDown style={{ fontSize: '25px' }} />}
                >
                  <Typography className="accordion-header">Address</Typography>
                </AccordionSummary>
                <Divider className="divider" />
                <AccordionDetails>
                  <Box
                    sx={{ width: '98%', color: '#1A3353', mb: 1 }}
                    component="form"
                    noValidate
                    autoComplete="off"
                  >
                    <div className="fieldContainer">
                      <div className="fieldSubContainer">
                        <div className="fieldTitle">Address Lane</div>
                        <TextField
                          required
                          name="address_line"
                          value={formData.address_line}
                          onChange={handleChange}
                          style={{ width: '70%' }}
                          size="small"                          error={Boolean(
                            (Array.isArray(profileErrors?.address_line) ? profileErrors?.address_line[0] : profileErrors?.address_line) ||
                            (Array.isArray(userErrors?.address_line) ? userErrors?.address_line[0] : userErrors?.address_line)
                          )}
                          helperText={
                            (Array.isArray(profileErrors?.address_line) ? profileErrors?.address_line[0] : profileErrors?.address_line) ||
                            (Array.isArray(userErrors?.address_line) ? userErrors?.address_line[0] : userErrors?.address_line) ||
                            ''
                          }
                        />
                      </div>
                      <div className="fieldSubContainer">
                        <div className="fieldTitle">Street</div>
                        <TextField
                          required
                          name="street"
                          value={formData.street}
                          onChange={handleChange}
                          style={{ width: '70%' }}
                          size="small"                          error={Boolean(
                            (Array.isArray(profileErrors?.street) ? profileErrors?.street[0] : profileErrors?.street) ||
                            (Array.isArray(userErrors?.street) ? userErrors?.street[0] : userErrors?.street)
                          )}
                          helperText={
                            (Array.isArray(profileErrors?.street) ? profileErrors?.street[0] : profileErrors?.street) ||
                            (Array.isArray(userErrors?.street) ? userErrors?.street[0] : userErrors?.street) ||
                            ''
                          }
                        />
                      </div>
                    </div>
                    <div className="fieldContainer2">
                      <div className="fieldSubContainer">
                        <div className="fieldTitle">City</div>
                        <TextField
                          required
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          style={{ width: '70%' }}
                          size="small"                          error={Boolean(
                            (Array.isArray(profileErrors?.city) ? profileErrors?.city[0] : profileErrors?.city) ||
                            (Array.isArray(userErrors?.city) ? userErrors?.city[0] : userErrors?.city)
                          )}
                          helperText={
                            (Array.isArray(profileErrors?.city) ? profileErrors?.city[0] : profileErrors?.city) ||
                            (Array.isArray(userErrors?.city) ? userErrors?.city[0] : userErrors?.city) ||
                            ''
                          }
                        />
                      </div>
                      <div className="fieldSubContainer">
                        <div className="fieldTitle">State</div>
                        <TextField
                          required
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          style={{ width: '70%' }}
                          size="small"                          error={Boolean(
                            (Array.isArray(profileErrors?.state) ? profileErrors?.state[0] : profileErrors?.state) ||
                            (Array.isArray(userErrors?.state) ? userErrors?.state[0] : userErrors?.state)
                          )}
                          helperText={
                            (Array.isArray(profileErrors?.state) ? profileErrors?.state[0] : profileErrors?.state) ||
                            (Array.isArray(userErrors?.state) ? userErrors?.state[0] : userErrors?.state) ||
                            ''
                          }
                        />
                      </div>
                    </div>
                    <div className="fieldContainer2">
                      <div className="fieldSubContainer">
                        <div className="fieldTitle">Postcode</div>
                        <TextField
                          required
                          name="postcode"
                          value={formData.postcode}
                          onChange={handleChange}
                          style={{ width: '70%' }}

                          size="small"
                          error={Boolean(
                            (Array.isArray(profileErrors?.postcode) ? profileErrors?.postcode[0] : profileErrors?.postcode) ||
                            (Array.isArray(userErrors?.postcode) ? userErrors?.postcode[0] : userErrors?.postcode)
                          )}
                          helperText={
                            (Array.isArray(profileErrors?.postcode) ? profileErrors?.postcode[0] : profileErrors?.postcode) ||
                            (Array.isArray(userErrors?.postcode) ? userErrors?.postcode[0] : userErrors?.postcode) ||
                            ''
                          }
                        />
                      </div>
                      <div className="fieldSubContainer">
                        <div className="fieldTitle">Country</div>
                        <FormControl sx={{ width: '70%' }}>                          <Select
                            name="country"
                            value={formData.country}
                            open={countrySelectOpen}
                            onClick={() =>
                              setCountrySelectOpen(!countrySelectOpen)
                            }
                            IconComponent={() => (
                              <div
                                onClick={() =>
                                  setCountrySelectOpen(!countrySelectOpen)
                                }
                                className="select-icon-background"
                              >
                                {countrySelectOpen ? (
                                  <FiChevronUp className="select-icon" />
                                ) : (
                                  <FiChevronDown className="select-icon" />
                                )}
                              </div>
                            )}
                            className={'select'}
                            onChange={handleChange}
                            error={!!profileErrors?.country?.[0]}
                          >
                            {COUNTRIES.map((option) => (
                                <MenuItem key={option[0]} value={option[0]}>
                                  {option[1]}
                                </MenuItem>
                              ))}
                          </Select>
                          <FormHelperText>
                            {(Array.isArray(profileErrors?.country) ? profileErrors?.country[0] : profileErrors?.country) ||
                             (Array.isArray(userErrors?.country) ? userErrors?.country[0] : userErrors?.country) ||
                             ''}
                          </FormHelperText>
                        </FormControl>
                      </div>
                    </div>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </div>
            {/* Business Hours */}
            {/* <div className='leadContainer'>
                            <Accordion defaultExpanded style={{ width: '98%' }}>
                        <AccordionSummary expandIcon={<FiChevronDown style={{ fontSize: '25px' }} />}>
                                    <Typography className='accordion-header'>Account Information</Typography>
                                </AccordionSummary>
                                <Divider className='divider' />
                                <AccordionDetails>
                                    <Box
                                        sx={{ width: '98%', color: '#1A3353' }}
                                        component='form'
                                        noValidate
                                        autoComplete='off'
                                    >
                                        <div>
                                            <div className='fieldSubContainer' style={{ marginLeft: '4.8%' }}>
                                                <div className='fieldTitle'>Business Hours</div>
                                                <TextField
                                                    name='lead_source'
                                                    select
                                                    // onChange={onChange}
                                                    // InputProps={{
                                                    //     classes: {
                                                    //         root: textFieldClasses.root
                                                    //     }
                                                    // }}
                                                    className="custom-textfield"
                                                    style={{ width: '70%' }}
                                                >
                                                    {state.roles && state.roles.map((option) => (
                          <MenuItem key={option[1]} value={option[0]}>
                            {option[0]}
                          </MenuItem>
                        ))} 
                                                </TextField>
                                            </div>
                                        </div>
                                    </Box>
                                </AccordionDetails>
                            </Accordion>
                        </div> */}
            {/* Preferences */}
            {/* <div className='leadContainer'>
                            <Accordion defaultExpanded style={{ width: '98%' }}>
                       <AccordionSummary expandIcon={<FiChevronDown style={{ fontSize: '25px' }} />}>
                                    <Typography className='accordion-header'>Account Information</Typography>
                                </AccordionSummary>
                                <Divider className='divider' />
                                <AccordionDetails>
                                    <Box
                                        sx={{ width: '98%', color: '#1A3353' }}
                                        component='form'
                                        noValidate
                                        autoComplete='off'
                                    >
                                        <div className='fieldContainer'>
                                            <div className='fieldSubContainer'>
                                                <div className='fieldTitle'>Default Page After Login</div>
                                                <TextField
                                                    name='lead_source'
                                                    select
                                                    // onChange={onChange}
                                                    // InputProps={{
                                                    //     classes: {
                                                    //         root: textFieldClasses.root
                                                    //     }
                                                    // }}
                                                    className="custom-textfield"
                                                    style={{ width: '70%' }}
                                                >
                                                    {state.roles && state.roles.map((option) => (
                          <MenuItem key={option[1]} value={option[0]}>
                            {option[0]}
                          </MenuItem>
                        ))} 
                                                </TextField>
                                            </div>
                                            <div className='fieldSubContainer'>
                                                <div className='fieldTitle'>Persone Name Format</div>
                                                <TextField
                                                    name='lead_source'
                                                    select
                                                    // onChange={onChange}
                                                    // InputProps={{
                                                    //     classes: {
                                                    //         root: textFieldClasses.root
                                                    //     }
                                                    // }}
                                                    className="custom-textfield"
                                                    style={{ width: '70%' }}
                                                >
                                                    {state.roles && state.roles.map((option) => (
                          <MenuItem key={option[1]} value={option[0]}>
                            {option[0]}
                          </MenuItem>
                        ))} 
                                                </TextField>
                                            </div>
                                        </div>
                                        <div className='fieldContainer2'>
                                            <div className='fieldSubContainer'>
                                                <div className='fieldTitle'>Prefferred Currency</div>
                                                <TextField
                                                    name='lead_source'
                                                    select
                                                    // onChange={onChange}
                                                    // InputProps={{
                                                    //     classes: {
                                                    //         root: textFieldClasses.root
                                                    //     }
                                                    // }}
                                                    className="custom-textfield"
                                                    style={{ width: '70%' }}
                                                >
                                                     {state.roles && state.roles.map((option) => (
                          <MenuItem key={option[1]} value={option[0]}>
                            {option[0]}
                          </MenuItem>
                        ))} 
                                                </TextField>
                                            </div>
                                            <div className='fieldSubContainer'>
                                                <div className='fieldTitle'>Digit Grouping Pattern</div>
                                                <TextField
                                                    name='lead_source'
                                                    select
                                                    // onChange={onChange}
                                                    // InputProps={{
                                                    //     classes: {
                                                    //         root: textFieldClasses.root
                                                    //     }
                                                    // }}
                                                    className="custom-textfield"
                                                    style={{ width: '70%' }}
                                                >
                                                    {state.roles && state.roles.map((option) => (
                          <MenuItem key={option[1]} value={option[0]}>
                            {option[0]}
                          </MenuItem>
                        ))} 
                                                </TextField>
                                            </div>
                                        </div>
                                        <div className='fieldContainer2'>
                                            <div className='fieldSubContainer'>
                                                <div className='fieldTitle'>Digit Grouping Seperator</div>
                                                <TextField
                                                    name='lead_source'
                                                    select
                                                    // onChange={onChange}
                                                    // InputProps={{
                                                    //     classes: {
                                                    //         root: textFieldClasses.root
                                                    //     }
                                                    // }}
                                                    className="custom-textfield"
                                                    style={{ width: '70%' }}
                                                >
                                                     {state.roles && state.roles.map((option) => (
                          <MenuItem key={option[1]} value={option[0]}>
                            {option[0]}
                          </MenuItem>
                        ))} 
                                                </TextField>
                                            </div>
                                            <div className='fieldSubContainer'>
                                                <div className='fieldTitle'>Number of Currency Decimals</div>
                                                <TextField
                                                    name='lead_source'
                                                    select
                                                    // onChange={onChange}
                                                    // InputProps={{
                                                    //     classes: {
                                                    //         root: textFieldClasses.root
                                                    //     }
                                                    // }}
                                                    className="custom-textfield"
                                                    style={{ width: '70%' }}
                                                >
                                                 {state.roles && state.roles.map((option) => (
                          <MenuItem key={option[1]} value={option[0]}>
                            {option[0]}
                          </MenuItem>
                        ))} 
                                                </TextField>
                                            </div>
                                        </div>
                                    </Box>
                                </AccordionDetails>
                            </Accordion>
                        </div> */}
            {/* Signature Block */}
            {/* <div className='leadContainer'>
                            <Accordion defaultExpanded style={{ width: '98%' }}>
                              <AccordionSummary expandIcon={<FiChevronDown style={{ fontSize: '25px' }} />}>
                                    <Typography className='accordion-header'>Account Information</Typography>
                                </AccordionSummary>
                                <Divider className='divider' />
                                <AccordionDetails>
                                    <Box
                                        sx={{ width: '100%', color: '#1A3353' }}
                                        component='form'
                                        noValidate
                                        autoComplete='off'
                                    >
                                        <div className='DescriptionDetail'>
                                            <div className='descriptionSubContainer'>
                                                <div className='descriptionTitle'>Signature</div>
                                                <TextareaAutosize
                                                    aria-label='minimum height'
                                                    name='description'
                                                    minRows={8}
                                                    // defaultValue={state.editData && state.editData.description ? state.editData.description : ''}
                                                    // onChange={onChange} 
                                                    style={{ width: '70%', padding: '5px' }}
                                                    placeholder='Add Description'
                                                />
                                            </div>
                                        </div>
                                    </Box>
                                </AccordionDetails>
                            </Accordion>
                        </div> */}
          </div>
        </form>
      </Box>
    </Box>
  );
}
