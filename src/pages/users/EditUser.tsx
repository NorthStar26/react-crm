import React, { ChangeEvent, useEffect, useState } from 'react';
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
  ButtonBase,
  styled,
  Alert,
  Snackbar,
  Modal,
  Slider,
} from '@mui/material';
import { UserUrl } from '../../services/ApiUrls';
import { fetchData } from '../../components/FetchData';
import { CustomAppBar } from '../../components/CustomAppBar';
import {
  FaArrowDown,
  FaCheckCircle,
  FaTimes,
  FaTimesCircle,
  FaUpload,
} from 'react-icons/fa';
import { MdOutlineMonochromePhotos } from 'react-icons/md';
import { AntSwitch, RequiredTextField } from '../../styles/CssStyled';
import { FiChevronDown } from '@react-icons/all-files/fi/FiChevronDown';
import { FiChevronUp } from '@react-icons/all-files/fi/FiChevronUp';
import { COUNTRIES } from '../../data/countries';
import '../../styles/style.css';
import { Badge } from '@mui/material';
import { uploadImageToCloudinary } from '../../utils/uploadImageToCloudinary';
// import Slider from 'material-ui/Slider';

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
  first_name?: string[];
  last_name?: string[];
  password?: string[];
  // has_sales_access?: string[];
  // has_marketing_access?: string[];
  // is_organization_admin?: string[];
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
  first_name: string;
  last_name: string;
  // has_sales_access: boolean,
  // has_marketing_access: boolean,
  // is_organization_admin: boolean
}
export function EditUser() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [reset, setReset] = useState(false);
  const [error, setError] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [profileErrors, setProfileErrors] = useState<FormErrors>({});
  const [userErrors, setUserErrors] = useState<FormErrors>({});
  const [roleSelectOpen, setRoleSelectOpen] = useState(false);
  const [countrySelectOpen, setCountrySelectOpen] = useState(false);
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
    profile_pic: '',
    first_name: '',
    last_name: '',
    // has_sales_access: false,
    // has_marketing_access: false,
    // is_organization_admin: false
  });
  const [successMessage, setSuccessMessage] = useState(false);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [info_message, setInfoMessage] = useState(
    'Profile picture updated successfully!'
  );
  useEffect(() => {
    setFormData(state?.value);
    getEditDetail(state?.id);
  }, [state?.id]);

  useEffect(() => {
    if (reset) {
      setFormData(state?.value);
    }
    return () => {
      setReset(false);
    };
  }, [reset]);

  const handleChange = (e: any) => {
    const { name, value, files, type, checked } = e.target;
    if (type === 'file') {
      setFormData({ ...formData, [name]: e.target.files?.[0] || null });
    }
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const backbtnHandle = () => {
    if (state?.edit) {
      navigate('/app/users');
    } else {
      navigate('/app/users/user-details', {
        state: { userId: state?.id, detail: true },
      });
    }
  };
  const handleSubmit = (e: any) => {
    e.preventDefault();
    submitForm();
  };

  // const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
  //     const file = event.target.files?.[0] || null;
  //     if (file) {
  //         const reader = new FileReader();
  //         reader.onload = () => {
  //             setFormData({ ...formData, profile_pic: reader.result as string });
  //         };
  //         reader.readAsDataURL(file);
  //     }
  // };

  const getEditDetail = (id: any) => {
      fetchData(`${UserUrl}/${id}/`, 'GET', null as any, Headers)
          .then((res: any) => {
              console.log('edit detail Form data:', res);
              if (!res.error) {
                  const data = res?.data?.profile_obj
                  setFormData({
                      email: data?.user_details?.email || '',
                      role: data.role || 'ADMIN',
                      phone: data.phone || '',
                      alternate_phone: data.alternate_phone || '',
                      address_line: data?.address?.address_line || '',
                      street: data?.address?.street || '',
                      city: data?.address?.city || '',
                      state: data?.address?.state || '',
                      postcode: data?.address?.postcode || '',
                      country: data?.address?.country || '',
                      profile_pic: data?.user_details?.profile_pic || null,
                      first_name: data?.user_details?.first_name || '',
                      last_name: data?.user_details?.last_name || '',
                  })
              }
              if (res.error) {
                  setError(true)
              }
          })
          .catch(() => {
          })
  }
  const submitForm = () => {
    const Header = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('Token'),
      org: localStorage.getItem('org'),
    };

    // validate the form
    const errors: FormErrors = {};
    if (!formData.email || formData.email.trim() === '') {
      errors.email = ['Email is required'];
    }
    if (!formData.first_name || formData.first_name.trim() === '') {
      errors.first_name = ['First name is required'];
    }
    if (!formData.last_name || formData.last_name.trim() === '') {
      errors.last_name = ['Last name is required'];
    }
    if (!formData.phone || formData.phone.trim() === '') {
      errors.phone = ['Phone number is required'];
    }
    setProfileErrors(errors);

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
      first_name: formData.first_name,
      last_name: formData.last_name,
      // profile_pic: formData.profile_pic,
      // has_sales_access: formData.has_sales_access,
      // has_marketing_access: formData.has_marketing_access,
      // is_organization_admin: formData.is_organization_admin
    };

    fetchData(`${UserUrl}/${state?.id}/`, 'PUT', JSON.stringify(data), Header)
      .then((res: any) => {
        // console.log('editsubmit:', res);
        if (!res.error) {
          resetForm();
          navigate('/app/users');
        }
        if (res.error) {
          setError(true);
          setProfileErrors(
            res?.errors?.profile_errors || res?.profile_errors[0]
          );
          setUserErrors(res?.errors?.user_errors || res?.user_errors[0]);
        }
      })
      .catch(() => {});
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
      profile_pic: '',
      first_name: '',
      last_name: '',
      // has_sales_access: false,
      // has_marketing_access: false,
      // is_organization_admin: false
    });
    setProfileErrors({});
    setUserErrors({});
  };
  const onCancel = () => {
    setReset(true);
    // resetForm()
  };
  const module = 'Users';
  const crntPage = 'Edit User';
  const backBtn = state?.edit ? 'Back To Users' : 'Back To UserDetails';

  const inputStyles = {
    display: 'none',
  };
  // console.log(state, 'edit',profileErrors)
  // console.log(formData, 'as', state);

  const StyledBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
      backgroundColor: '#44b700',
      color: '#44b700',
      boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
      '&::after': {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        animation: 'ripple 1.2s infinite ease-in-out',
        border: '1px solid currentColor',
        content: '""',
      },
    },
    '@keyframes ripple': {
      '0%': {
        transform: 'scale(.8)',
        opacity: 1,
      },
      '100%': {
        transform: 'scale(2.4)',
        opacity: 0,
      },
    },
  }));

  const SmallAvatar = styled(Avatar)(({ theme }) => ({
    width: 28,
    height: 28,
    border: `2px solid ${theme.palette.background.paper}`,
  }));

  // handle avatar change
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const { url } = await uploadImageToCloudinary(file as File);
    if (url) {
      fetchData(
        `${UserUrl}/${state?.id}/image/`,
        'PUT',
        JSON.stringify({ profile_pic: url, email: formData.email }),
        {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem('Token'),
          org: localStorage.getItem('org'),
        }
      )
        .then((res: any) => {
          if (!res.error) {
            setFormData({ ...formData, profile_pic: url });
            setInfoMessage('Profile picture updated successfully!');
            setSuccessMessage(true);
            setTimeout(() => {
              setSuccessMessage(false);
            }, 3000);
          } else {
            setProfileErrors(
              res?.errors?.profile_errors || res?.profile_errors[0]
            );
          }
        })
        .catch((err) => {
          console.error('Error updating profile picture:', err);
          setProfileErrors({
            profile_pic: ['Failed to update profile picture'],
          });
        });
    }
  };

  const changePassword = async () => {
    if (newPassword !== confirmPassword) {
      setProfileErrors({ password: ['Passwords do not match'] });
      return;
    }
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('Token'),
      org: localStorage.getItem('org'),
    };
    const body = JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
      confirm_password: confirmPassword,
      email: formData.email,
    });
    fetchData(`auth/reset-password/`, 'PUT', body, headers)
      .then((res: any) => {
        if (!res.error) {
          setOpen(false);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setInfoMessage('Password changed successfully!');
          setSuccessMessage(true);
        } else {
          setProfileErrors(
            res?.errors?.profile_errors || res?.profile_errors[0]
          );
        }
      })
      .catch((err) => {
        if (err?.data?.current_password) {
          setProfileErrors({ password: err.data.current_password });
        } else {
          console.error('Error changing password:', err);
          setProfileErrors({ password: ['Failed to change password'] });
        }
      });
  };

  console.log(formData, 'formData');
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
          <Snackbar
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            autoHideDuration={5000}
            onClose={() => setSuccessMessage(false)}
            open={successMessage}
            message={info_message}
            key={'top' + 'center'}
            // set color to green
            sx={{
              '& .MuiSnackbarContent-root': {
                backgroundColor: '#4caf50', // Green color for success
                color: '#fff',
              },
            }}
          />
          <div style={{ padding: '10px' }}>
            <div className="leadContainer">
              <Accordion defaultExpanded style={{ width: '98%' }}>
                <AccordionSummary
                  expandIcon={<FiChevronDown style={{ fontSize: '25px' }} />}
                >
                  <Typography className="accordion-header">
                    User Information
                  </Typography>
                </AccordionSummary>
                <Divider className="divider" />
                <AccordionDetails>
                  {/* Display user avatar */}
                  <Box
                    sx={{
                      width: '98%',
                      mb: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                    }}
                    component="form"
                    noValidate
                    autoComplete="off"
                  >
                    <ButtonBase
                      component="label"
                      role={undefined}
                      tabIndex={-1} // prevent label from tab focus
                      aria-label="Avatar image"
                      sx={{
                        borderRadius: '40px',
                        '&:has(:focus-visible)': {
                          outline: '2px solid',
                          outlineOffset: '2px',
                        },
                      }}
                    >
                      <Badge
                        overlap="circular"
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'right',
                        }}
                        badgeContent={
                          <MdOutlineMonochromePhotos color="green" size={24} />
                        }
                      >
                        <Avatar
                          alt="profile image"
                          src={formData.profile_pic || ''}
                          sx={{
                            width: 100,
                            height: 100,
                            border: '2px solid #FCDDEC',
                            p: 0.5,
                          }}
                        />
                      </Badge>
                      <input
                        type="file"
                        accept="image/*"
                        style={{
                          border: 0,
                          clip: 'rect(0 0 0 0)',
                          height: '1px',
                          margin: '-1px',
                          overflow: 'hidden',
                          padding: 0,
                          position: 'absolute',
                          whiteSpace: 'nowrap',
                          width: '1px',
                        }}
                        onChange={handleAvatarChange}
                      />
                    </ButtonBase>
                  </Box>
                  <Box
                    sx={{ width: '98%', color: '#1A3353', mb: 1 }}
                    component="form"
                    noValidate
                    autoComplete="off"
                  >
                    <div className="fieldContainer2">
                      <div className="fieldSubContainer">
                        <div className="fieldTitle">First Name</div>

                        <RequiredTextField
                          required
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleChange}
                          style={{ width: '70%' }}
                          size="small"
                          error={
                            !!profileErrors?.first_name?.[0] ||
                            !!userErrors?.first_name?.[0]
                          }
                          helperText={
                            profileErrors?.first_name?.[0] ||
                            userErrors?.first_name?.[0] ||
                            ''
                          }
                        />
                      </div>
                      <div className="fieldSubContainer">
                        <div className="fieldTitle">Last Name</div>

                        <RequiredTextField
                          required
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleChange}
                          style={{ width: '70%' }}
                          size="small"
                          error={
                            !!profileErrors?.last_name?.[0] ||
                            !!userErrors?.last_name?.[0]
                          }
                          helperText={
                            profileErrors?.last_name?.[0] ||
                            userErrors?.last_name?.[0] ||
                            ''
                          }
                        />
                      </div>
                    </div>
                    <div className="fieldContainer">
                      <div className="fieldSubContainer">
                        <div className="fieldTitle">Email</div>
                        <RequiredTextField
                          required
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          style={{
                            width: '70%',
                            outline: 'none',
                            border: 'none',
                          }}
                          size="small"
                          InputProps={{ readOnly: true }}
                          error={
                            !!profileErrors?.email?.[0] ||
                            !!userErrors?.email?.[0]
                          }
                          helperText={
                            profileErrors?.email?.[0] ||
                            userErrors?.email?.[0] ||
                            ''
                          }
                        />
                      </div>
                      <div className="fieldSubContainer">
                        <div className="fieldTitle">Password</div>
                        {/* add change password button */}
                        <Button
                          variant="contained"
                          onClick={() => handleOpen()}
                        >
                          Change Password
                        </Button>
                        <Modal
                          open={open}
                          onClose={handleClose}
                          aria-labelledby="modal-modal-title"
                          aria-describedby="modal-modal-description"
                        >
                          <Box
                            sx={{
                              p: 4,
                              bgcolor: 'background.paper',
                              borderRadius: 2,
                              boxShadow: 24,
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              width: '530px',
                              maxHeight: '80vh',
                            }}
                          >
                            <Typography sx={{ fontWeight: 'bold' }}>
                              Change Password
                            </Typography>
                            <Divider sx={{ my: 2 }} />

                            <Box
                              sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                gap: 2,
                                alignItems: 'center',
                                justifyContent: 'end',
                                mb: 2,
                              }}
                            >
                              <Typography>Current Password</Typography>

                              <RequiredTextField
                                variant="outlined"
                                name="current_password"
                                value={currentPassword}
                                onChange={(e) =>
                                  setCurrentPassword(e.target.value)
                                }
                                required
                                style={{ width: '70%' }}
                                size="small"
                                type="password"
                                label="Current Password"
                              />
                            </Box>
                            <Box
                              sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                gap: 2,
                                alignItems: 'center',
                                justifyContent: 'end',
                                mb: 2,
                              }}
                            >
                              <Typography>New Password</Typography>

                              <RequiredTextField
                                variant="outlined"
                                name="new_password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                style={{ width: '70%' }}
                                size="small"
                                type="password"
                                label="New Password"
                              />
                            </Box>
                            <Box
                              sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                gap: 2,
                                alignItems: 'center',
                                justifyContent: 'end',
                                mb: 2,
                              }}
                            >
                              <Typography>Confirm Password</Typography>

                              <RequiredTextField
                                variant="outlined"
                                name="confirm_password"
                                value={confirmPassword}
                                onChange={(e) =>
                                  setConfirmPassword(e.target.value)
                                }
                                required
                                style={{ width: '70%' }}
                                size="small"
                                type="password"
                                label="Confirm Password"
                              />
                            </Box>
                            <Typography
                              sx={{
                                color: '#d32f2f',
                                fontSize: '12px',
                                mb: 2,
                                textAlign: 'center',
                              }}
                            >
                              {profileErrors.password && (
                                <FormHelperText
                                  sx={{ textAlign: 'center' }}
                                  error
                                >
                                  {profileErrors.password.join(', ')}
                                </FormHelperText>
                              )}
                            </Typography>
                            <Box
                              sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                gap: 2,
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 2,
                                mt: 3,
                              }}
                            >
                              <Button
                                className="header-button"
                                onClick={() => setOpen(false)}
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
                                // type='submit'
                                className="header-button"
                                onClick={changePassword}
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
                              >
                                Save
                              </Button>
                            </Box>
                          </Box>
                        </Modal>
                      </div>
                    </div>
                    <div className="fieldContainer2">
                      <div className="fieldSubContainer">
                        <div className="fieldTitle">Phone Number</div>
                        <Tooltip title="Please enter a valid international phone number (e.g. +14155552671)">
                          <RequiredTextField
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            style={{ width: '70%' }}
                            size="small"
                            error={
                              !!profileErrors?.phone?.[0] ||
                              !!userErrors?.phone?.[0]
                            }
                            helperText={
                              profileErrors?.phone?.[0] ||
                              userErrors?.phone?.[0] ||
                              ''
                            }
                          />
                        </Tooltip>
                      </div>

                      <div className="fieldSubContainer">
                        <div className="fieldTitle">Alternate Phone</div>
                        <Tooltip title="Please enter a valid international phone number (e.g. +14155552671)">
                          <RequiredTextField
                            required
                            name="alternate_phone"
                            value={formData.alternate_phone}
                            onChange={handleChange}
                            style={{ width: '70%' }}
                            size="small"
                            error={
                              !!profileErrors?.alternate_phone?.[0] ||
                              !!userErrors?.alternate_phone?.[0] ||
                              (formData.phone === formData.alternate_phone &&
                                formData.alternate_phone !== '') // Check if both numbers are same
                            }
                            helperText={
                              profileErrors?.alternate_phone?.[0] ||
                              userErrors?.alternate_phone?.[0] ||
                              (formData.phone === formData.alternate_phone &&
                              formData.alternate_phone !== ''
                                ? 'Phone number and alternate phone number cannot be the same.' // Warning message
                                : '')
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
                          value={formData?.address_line}
                          onChange={handleChange}
                          style={{ width: '70%' }}
                          size="small"
                          error={
                            !!profileErrors?.address_line?.[0] ||
                            !!userErrors?.address_line?.[0]
                          }
                          helperText={
                            profileErrors?.address_line?.[0] ||
                            userErrors?.address_line?.[0] ||
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
                          size="small"
                          error={
                            !!profileErrors?.street?.[0] ||
                            !!userErrors?.street?.[0]
                          }
                          helperText={
                            profileErrors?.street?.[0] ||
                            userErrors?.street?.[0] ||
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
                          size="small"
                          error={
                            !!profileErrors?.city?.[0] ||
                            !!userErrors?.city?.[0]
                          }
                          helperText={
                            profileErrors?.city?.[0] ||
                            userErrors?.city?.[0] ||
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
                          size="small"
                          error={
                            !!profileErrors?.state?.[0] ||
                            !!userErrors?.state?.[0]
                          }
                          helperText={
                            profileErrors?.state?.[0] ||
                            userErrors?.state?.[0] ||
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
                          error={
                            !!profileErrors?.postcode?.[0] ||
                            !!userErrors?.postcode?.[0]
                          }
                          helperText={
                            profileErrors?.postcode?.[0] ||
                            userErrors?.postcode?.[0] ||
                            ''
                          }
                        />
                      </div>
                      <div className="fieldSubContainer">
                        <div className="fieldTitle">Country</div>
                        <FormControl sx={{ width: '70%' }}>
                          <Select
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
                            {profileErrors?.country?.[0]
                              ? profileErrors?.country?.[0]
                              : ''}
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
                                <AccordionSummary
                                    expandIcon={<FaArrowDown />}
                                    aria-controls='panel1a-content'
                                    id='panel1a-header'
                                >
                                    <div className='typography'>
                                        <Typography
                                            style={{ marginBottom: '15px', fontWeight: 'bold' }}
                                        >
                                            Business Hours
                                        </Typography>
                                    </div>
                                </AccordionSummary>
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
                                <AccordionSummary
                                    expandIcon={<FaArrowDown />}
                                    aria-controls='panel1a-content'
                                    id='panel1a-header'
                                >
                                    <div className='typography'>
                                        <Typography
                                            style={{ marginBottom: '15px', fontWeight: 'bold' }}
                                        >
                                            Preferences
                                        </Typography>
                                    </div>
                                </AccordionSummary>
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
                                <AccordionSummary
                                    expandIcon={<FaArrowDown />}
                                    aria-controls='panel1a-content'
                                    id='panel1a-header'
                                >
                                    <div className='typography'>
                                        <Typography style={{ marginBottom: '15px', fontWeight: 'bold' }}>Signature Block</Typography>
                                    </div>
                                </AccordionSummary>
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
