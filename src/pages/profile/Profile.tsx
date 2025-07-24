import React, { useEffect, useState } from 'react';
import {
  Card,
  Avatar,
  Box,
  Typography,
  TextField,
  Grid,
  styled,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  FormControl,
  Select,
  MenuItem,
  FormHelperText,
  IconButton,
  Snackbar,
  Tooltip,
  Input
} from '@mui/material';
import { FaChevronDown, FaTrashAlt, FaUpload } from 'react-icons/fa';
import { FiChevronDown } from '@react-icons/all-files/fi/FiChevronDown';
import { FiChevronUp } from '@react-icons/all-files/fi/FiChevronUp';
import { MdOutlineMonochromePhotos } from 'react-icons/md';
import { fetchData } from '../../components/FetchData';
import { UserUrl } from '../../services/ApiUrls';
import { COUNTRIES } from '../../data/countries';
import { useUser } from '../../context/UserContext';
import { uploadImageToCloudinary } from '../../utils/uploadImageToCloudinary';

// File validation constants
const SUPPORTED_FORMATS = ['image/jpg', 'image/jpeg', 'image/png'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

type Response = {
  user_details: {
    email: string;
    profile_pic: string;
    first_name: string;
    last_name: string;
    id: string;
  };
  address: {
    address_line: string;
    number: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    country_display: string;
    street: string;
  };
  phone: string;
  alternate_phone: string;
};

const AvatarContainer = styled('div')({
  position: 'relative',
  width: 150,
  height: 150,
  '&:hover .avatar-actions': {
    opacity: 1,
  },
});

const AvatarActionButton = styled(IconButton)({
  position: 'absolute',
  backgroundColor: '#1A3353',
  color: 'white',
  transition: 'opacity 0.3s ease-in-out',
  opacity: 0,
  '&:hover': {
    backgroundColor: '#1A3353',
  },
});

const HiddenInput = styled('input')({
  display: 'none',
});

export default function Profile() {
  const { user, updateProfile, isLoading } = useUser();
  const [countrySelectOpen, setCountrySelectOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [infoMessage, setInfoMessage] = useState('Profile picture updated successfully!');
  const [profilePic, setProfilePic] = useState(user?.user_details.profile_pic || '');
  const [profileErrors, setProfileErrors] = useState<{profile_pic?: string[]}>({});

  const inputStyles = {
    width: '313px',
    '& .MuiOutlinedInput-root': {
      height: '40px',
      borderRadius: '4px'
    }
  };

  const labelStyles = {
    width: 110,
    fontWeight: 500,
    color: '#1A3353',
    textAlign: 'right' as const,
    mr: 2,
    whiteSpace: 'nowrap'
  };

  const saveButtonSx = {
    width: 100,
    height: 40,
    borderRadius: '4px',
    background: 'var(--color-azure-46, #1976D2)',
    boxShadow:
      '0px 1px 5px 0px #0000001F, 0px 2px 2px 0px #00000024, 0px 3px 1px -2px #00000033'
  };

  const cancelButtonSx = {
    width: 100,
    height: 40,
    borderRadius: '4px',
    background: 'var(--color-azure-31, #2B5075)',
    boxShadow:
      '0px 1px 5px 0px #0000001F, 0px 2px 2px 0px #00000024, 0px 3px 1px -2px #00000033'
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;

    if (!SUPPORTED_FORMATS.includes(file.type)) {
      setProfileErrors({
        profile_pic: ['Unsupported file format. Please upload a JPG or PNG image.']
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setProfileErrors({
        profile_pic: ['File size exceeds 5MB limit.']
      });
      return;
    }

    setProfileErrors({ profile_pic: undefined });

    try {
      const { url } = await uploadImageToCloudinary(file);
      if (url) {
        await updateProfilePicture(url);
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setProfileErrors({
        profile_pic: ['Failed to upload profile picture']
      });
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: localStorage.getItem('Token') || '',
        org: localStorage.getItem('org') || '',
      };

      const response = await fetchData(
        `${UserUrl}/${user?.user_details.id}/image/`,
        'PUT',
        JSON.stringify({ profile_pic: '', email: user?.user_details.email }),
        headers
      );

      if (!response.error) {
        setProfilePic('');
        setInfoMessage('Profile picture removed successfully!');
        setSuccessMessage(true);
        setTimeout(() => setSuccessMessage(false), 3000);
      } else {
        throw new Error('Failed to remove profile picture');
      }
    } catch (err) {
      console.error('Error removing profile picture:', err);
      setProfileErrors({
        profile_pic: ['Failed to remove profile picture']
      });
    }
  };

  const updateProfilePicture = async (url: string) => {
    try {
      const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: localStorage.getItem('Token') || '',
        org: localStorage.getItem('org') || '',
      };

      const response = await fetchData(
        `${UserUrl}/${user?.user_details.id}/image/`,
        'PUT',
        JSON.stringify({ profile_pic: url, email: user?.user_details.email }),
        headers
      );

      if (!response.error) {
        setProfilePic(url);
        setInfoMessage('Profile picture updated successfully!');
        setSuccessMessage(true);
        setTimeout(() => setSuccessMessage(false), 3000);
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      console.error('Error updating profile picture:', err);
      setProfileErrors({
        profile_pic: ['Failed to update profile picture']
      });
    }
  };

  if (isLoading || !user) {
    return <Box sx={{ mt: 8, px: 2 }}>Loading...</Box>;
  }

  return (
    <Box sx={{ mt: 8, px: 2 }}>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        autoHideDuration={5000}
        onClose={() => setSuccessMessage(false)}
        open={successMessage}
        message={infoMessage}
        key={'top' + 'center'}
        sx={{
          '& .MuiSnackbarContent-root': {
            backgroundColor: '#4caf50',
            color: '#fff',
          },
        }}
      />
      
      <Box sx={{
        height: 50,
        backgroundColor: 'var(--color-azure-21, #1A3353)',
        borderRadius: '4px 4px 0 0',
        display: 'flex',
        alignItems: 'center',
        px: 2
      }}>
        <Typography variant="subtitle1" sx={{ color: '#FFFFFF !important' }}>
          My Profile
        </Typography>
        <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
          <Button variant="contained" sx={cancelButtonSx}>Cancel</Button>
          <Button variant="contained" sx={saveButtonSx}>Save</Button>
        </Box>
      </Box>

      <Card sx={{
        borderRadius: '0 0 4px 4px',
        backgroundColor: 'var(--color-white-solid, #FFFFFF)',
        p: 4
      }}>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<FaChevronDown />}>
            <Typography variant="h6" sx={{
              fontFamily: 'Roboto',
              fontWeight: 600,
              fontSize: '18px',
              lineHeight: '27px',
              letterSpacing: '0.17px',
              verticalAlign: 'middle'
            }}>
              User Information
            </Typography>
          </AccordionSummary>
          <Divider sx={{ height: '2px', backgroundColor: 'rgba(0,0,0,0.12)', mx: 4, mb: 2 }} />
          <AccordionDetails>
            <Grid container spacing={4} justifyContent="center" alignItems="flex-start">
              <Grid item xs={12} container justifyContent="center" sx={{ flexDirection: 'column', alignItems: 'center' }}>
                <AvatarContainer>
                  <Avatar
                    src={profilePic || ''}
                    alt="Profile"
                    sx={{ width: 150, height: 150, border: '2px solid pink' }}
                  />

                  <HiddenInput
                    id="avatar-upload"
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={handleAvatarChange}
                  />

                  <label htmlFor="avatar-upload" style={{ cursor: 'pointer' }}>
                    <AvatarActionButton
                      title="Upload"
                      className="avatar-actions"
                      sx={{
                        top: '10px',
                        right: '-35px',
                      }}
                      onClick={() => document.getElementById('avatar-upload')?.click()}

                    >
                      <FaUpload />
                    </AvatarActionButton>
                  </label>

                  <AvatarActionButton
                    title="Camera"
                    className="avatar-actions"
                    sx={{
                      top: '55px',
                      right: '-42px',
                    }}
                  >
                    <MdOutlineMonochromePhotos />
                  </AvatarActionButton>

                  {profilePic && (
                    <AvatarActionButton
                      title="Remove"
                      className="avatar-actions"
                      sx={{
                        top: '100px',
                        right: '-35px',
                      }}
                      onClick={handleDeleteAvatar}
                    >
                      <FaTrashAlt />
                    </AvatarActionButton>
                  )}
                </AvatarContainer>
                
                {profileErrors?.profile_pic?.[0] && (
                  <Typography 
                    color="error" 
                    variant="caption" 
                    sx={{ 
                      display: 'block', 
                      textAlign: 'center', 
                      mt: 1 
                    }}
                  >
                    {profileErrors.profile_pic[0]}
                  </Typography>
                )}
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box display="flex" alignItems="center">
                    <Typography sx={labelStyles}>First Name</Typography>
                    <TextField value={user?.user_details.first_name || ''} InputProps={{ readOnly: true }} placeholder="—" sx={inputStyles} />
                  </Box>
                  <Box display="flex" alignItems="center" sx={{ minHeight: 40 }}>
                    <Typography sx={labelStyles}>Email</Typography>
                    <Typography>{user?.user_details.email || 'sample@example.com'}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center">
                    <Typography sx={labelStyles}>Phone Number</Typography>
                    <TextField
                      value={user?.phone || ''}
                      InputProps={{ readOnly: true }}
                      placeholder="—"
                      sx={inputStyles}
                    />
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box display="flex" alignItems="center">
                    <Typography sx={labelStyles}>Last Name</Typography>
                    <TextField value={user?.user_details.last_name || ''} InputProps={{ readOnly: true }} placeholder="—" sx={inputStyles} />
                  </Box>
                  <Box display="flex" alignItems="center" sx={{ minHeight: 40 }}>
                    <Typography sx={labelStyles}>Password</Typography>
                    <Button
                      variant="contained"
                      sx={{
                        width: 180,
                        height: 40,
                        borderRadius: '4px',
                        background: '#1976D2',
                        boxShadow: '0px 1px 5px 0px #0000001F, 0px 2px 2px 0px #00000024, 0px 3px 1px -2px #00000033'
                      }}
                    >
                      Change Password
                    </Button>
                  </Box>
                  <Box display="flex" alignItems="center">
                    <Typography sx={labelStyles}>Alternate Phone</Typography>
                    <TextField
                      value={user?.alternate_phone || ''}
                      InputProps={{ readOnly: true }}
                      placeholder="—"
                      sx={inputStyles}
                    />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Accordion defaultExpanded sx={{ mt: 3 }}>
          <AccordionSummary expandIcon={<FaChevronDown />}>
            <Typography variant="h6" sx={{
              fontFamily: 'Roboto',
              fontWeight: 600,
              fontSize: '18px',
              lineHeight: '27px',
              letterSpacing: '0.17px',
              verticalAlign: 'middle'
            }}>
              Address
            </Typography>
          </AccordionSummary>
          <Divider sx={{ height: '2px', backgroundColor: 'rgba(0,0,0,0.12)', mx: 4, mb: 2 }} />
          <AccordionDetails>
            <Grid container spacing={4} justifyContent="center" alignItems="flex-start">
              <Grid item xs={12} sm={6}>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box display="flex" alignItems="center">
                    <Typography sx={labelStyles}>Address Lane</Typography>
                    <TextField
                      value={user?.address.address_line || ''}
                      InputProps={{ readOnly: true }}
                      placeholder="—"
                      sx={inputStyles}
                    />
                  </Box>
                  <Box display="flex" alignItems="center">
                    <Typography sx={labelStyles}>City</Typography>
                    <TextField
                      value={user?.address.city || ''}
                      InputProps={{ readOnly: true }}
                      placeholder="—"
                      sx={inputStyles}
                    />
                  </Box>
                  <Box display="flex" alignItems="center">
                    <Typography sx={labelStyles}>Postcode</Typography>
                    <TextField
                      value={user?.address.postcode || ''}
                      InputProps={{ readOnly: true }}
                      placeholder="—"
                      sx={inputStyles}
                    />
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box display="flex" alignItems="center">
                    <Typography sx={labelStyles}>Street</Typography>
                    <TextField
                      value={user?.address.street || ''}
                      InputProps={{ readOnly: true }}
                      placeholder="—"
                      sx={inputStyles}
                    />
                  </Box>
                  <Box display="flex" alignItems="center">
                    <Typography sx={labelStyles}>State</Typography>
                    <TextField
                      value={user?.address.state || ''}
                      InputProps={{ readOnly: true }}
                      placeholder="—"
                      sx={inputStyles}
                    />
                  </Box>
                  <Box display="flex" alignItems="center">
                    <Typography sx={labelStyles}>Country</Typography>
                    <FormControl sx={{ ...inputStyles, position: 'relative' }}>
                      <Select
                        value={user?.address.country || ''}
                        open={countrySelectOpen}
                        onClick={() => setCountrySelectOpen(!countrySelectOpen)}
                        displayEmpty
                        inputProps={{ readOnly: true }}
                        IconComponent={() => (
                          <Box
                            sx={{
                              position: 'absolute',
                              right: 0,
                              top: 0,
                              height: '100%',
                              width: '36px',
                              backgroundColor: '#f5f5f5',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderTopRightRadius: '4px',
                              borderBottomRightRadius: '4px',
                              pointerEvents: 'none'
                            }}
                          >
                            <FiChevronDown style={{ fontSize: '20px', color: '#333' }} />
                          </Box>
                        )}
                        sx={{
                          '& .MuiSelect-select': {
                            display: 'flex',
                            alignItems: 'center',
                            height: '40px',
                            paddingRight: '36px'
                          }
                        }}
                      >
                        {COUNTRIES.map(([code, name]) => (
                          <MenuItem key={code} value={code}>
                            {name}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>{user?.address.country_display || ''}</FormHelperText>
                    </FormControl>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Card>
    </Box>
  );
}