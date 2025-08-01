import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Input,
  Modal,
  Slider,
  IconButtonProps,
} from '@mui/material';
import { FaChevronDown, FaTrashAlt, FaUpload, FaTimesCircle } from 'react-icons/fa';
import { FiChevronDown } from '@react-icons/all-files/fi/FiChevronDown';
import { FiChevronUp } from '@react-icons/all-files/fi/FiChevronUp';
import { fetchData } from '../../components/FetchData';
import { UserUrl } from '../../services/ApiUrls';
import { COUNTRIES } from '../../data/countries';
import { useUser } from '../../context/UserContext';
import { MdOutlineMonochromePhotos } from 'react-icons/md';
import { Camera, PhotoCamera } from '@mui/icons-material';
import { uploadImageToCloudinary } from '../../utils/uploadImageToCloudinary';

// File validation constants
const SUPPORTED_FORMATS = ['image/jpg', 'image/jpeg', 'image/png'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

type FormErrors = {
  email?: string[];
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
};

interface FormData {
  email: string;
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
}

interface AvatarActionButtonProps extends IconButtonProps {
  isEditing: boolean;
}

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

const AvatarContainer = styled('div') <{ isEditing: boolean }>(({ isEditing }) => ({
  position: 'relative',
  width: 150,
  height: 150,
  '& .avatar-actions': {
    transition: 'opacity 0.3s ease-in-out',
    opacity: isEditing ? 0 : 0, // Hidden by default when isEditing is true
    pointerEvents: isEditing ? 'auto' : 'none',
  },
  '&:hover .avatar-actions': {
    opacity: isEditing ? 1 : 0, // Show only when isEditing is true and hovering
    pointerEvents: isEditing ? 'auto' : 'none',
  },
}));

const AvatarActionButton = styled(IconButton)<AvatarActionButtonProps>(({ isEditing }) => ({
  position: 'absolute',
  backgroundColor: '#1A3353',
  color: 'white',
  '&:hover': {
    backgroundColor: '#1e3750',
  },
}));

const HiddenInput = styled('input')({
  display: 'none',
});

export default function Profile() {
  const { user, updateProfile, isLoading, loadUserProfile } = useUser();
  const [countrySelectOpen, setCountrySelectOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [infoMessage, setInfoMessage] = useState('Profile picture updated successfully!');
  const [profilePic, setProfilePic] = useState(user?.user_details.profile_pic || '');
  const [profileErrors, setProfileErrors] = useState<FormErrors>({});
  const [userErrors, setUserErrors] = useState<FormErrors>({});

  // use camera for user's avatar
  const [cameraOpen, setCameraOpen] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1); // Default zoom level is 1 (no zoom)
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Form data state
  const [formData, setFormData] = useState<FormData>({
    email: '',
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
  });
  
  const { state } = useLocation();

  // isCurrentUser
  const isCurrentUser = user && user.user_details?.id
  ? (state?.id ? user.user_details.id.toString() === state.id.toString() : true)
  : false;

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  
  // Password change modal state
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setProfileErrors({ ...profileErrors, password: undefined });
  };

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      setFormData({
        email: user.user_details.email || '',
        phone: user.phone || '',
        alternate_phone: user.alternate_phone || '',
        address_line: user.address.address_line || '',
        street: user.address.street || '',
        city: user.address.city || '',
        state: user.address.state || '',
        postcode: user.address.postcode || '',
        country: user.address.country || '',
        profile_pic: user.user_details.profile_pic || '',
        first_name: user.user_details.first_name || '',
        last_name: user.user_details.last_name || '',
      });
      setProfilePic(user.user_details.profile_pic || '');
    }
  }, [user]);

  // Initialize and clean up camera stream
  useEffect(() => {
    if (cameraOpen) {
      // Start the camera stream when modal opens
      const startCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          console.log('Stream initialized:', stream);
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch((error) => {
              console.error('Error playing video:', error);
            });
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setCameraOpen(false); // Close modal if camera access fails
        }
      };

      startCamera();
    }

    // Cleanup function to stop the stream when modal closes or component unmounts
    return () => {
      if (streamRef.current) {
        console.log('Stopping stream');
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [cameraOpen]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear errors for the specific field being changed
    if (profileErrors[name as keyof FormErrors]) {
      setProfileErrors({ ...profileErrors, [name]: undefined });
    }
    if (userErrors[name as keyof FormErrors]) {
      setUserErrors({ ...userErrors, [name]: undefined });
    }
  };

  const handleSave = async () => {
    try {
      const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: localStorage.getItem('Token') || '',
        org: localStorage.getItem('org') || '',
      };

      const data = {
        email: formData.email,
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
        role: user?.role || 'USER', // Include current user's role to satisfy backend requirement
      };

      const response = await fetchData(
        `${UserUrl}/${user?.user_details.id}/`,
        'PUT',
        JSON.stringify(data),
        headers
      );

      if (!response.error) {
        setInfoMessage('Profile updated successfully!');
        setSuccessMessage(true);
        setIsEditing(false);
        setTimeout(() => setSuccessMessage(false), 3000);
        
        // Reload user profile to get updated data
        await loadUserProfile();
      } else {
        if (response.status === 400 && response.data) {
          setProfileErrors(response.data?.errors?.profile_errors || {});
          setUserErrors(response.data?.errors?.user_errors || {});
        } else {
          throw new Error(response.error || 'Failed to update profile');
        }
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setInfoMessage('Failed to update profile');
      setSuccessMessage(true);
      setTimeout(() => setSuccessMessage(false), 3000);
    }
  };

  const handleCancel = () => {
    // Reset form data to original user data
    if (user) {
      setFormData({
        email: user.user_details.email || '',
        phone: user.phone || '',
        alternate_phone: user.alternate_phone || '',
        address_line: user.address.address_line || '',
        street: user.address.street || '',
        city: user.address.city || '',
        state: user.address.state || '',
        postcode: user.address.postcode || '',
        country: user.address.country || '',
        profile_pic: user.user_details.profile_pic || '',
        first_name: user.user_details.first_name || '',
        last_name: user.user_details.last_name || '',
      });
    }
    setIsEditing(false);
    setProfileErrors({});
    setUserErrors({});
  };

  const handleChangePassword = async () => {
    // Validate password fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      setProfileErrors({ password: ['All password fields are required'] });
      return;
    }

    if (newPassword !== confirmPassword) {
      setProfileErrors({ password: ['New password and confirm password do not match'] });
      return;
    }

    if (newPassword.length < 8) {
      setProfileErrors({ password: ['New password must be at least 8 characters long'] });
      return;
    }

    try {
      const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: localStorage.getItem('Token') || '',
        org: localStorage.getItem('org') || '',
      };

      const data = {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
        email: user?.user_details.email,
      };

      const response = await fetchData(
        `auth/reset-password/`,
        'PUT',
        JSON.stringify(data),
        headers
      );

      if (!response.error) {
        setInfoMessage('Password changed successfully!');
        setSuccessMessage(true);
        handleClose();
        setTimeout(() => setSuccessMessage(false), 3000);
      } else {
        setProfileErrors({ password: [response.error || 'Failed to change password'] });
      }
    } catch (err) {
      console.error('Error changing password:', err);
      setProfileErrors({ password: ['Failed to change password'] });
    }
  };

    // camera

    const handleOpenCamera = () => {
      setCameraOpen(true); // Simply open the modal; stream is handled in useEffect
    };
  
    const handleCapture = async () => {
      if (canvasRef.current && videoRef.current) {
        const context = canvasRef.current.getContext('2d');
        if (context) {
          const canvasWidth = canvasRef.current.width; // 500
          const canvasHeight = canvasRef.current.height; // 500
          const videoWidth = videoRef.current.videoWidth;
          const videoHeight = videoRef.current.videoHeight;
    
          // Calculate the zoomed area to capture (centered)
          const zoomFactor = zoom;
          const zoomedWidth = videoWidth / zoomFactor;
          const zoomedHeight = videoHeight / zoomFactor;
          const offsetX = (videoWidth - zoomedWidth) / 2; // Center horizontally
          const offsetY = (videoHeight - zoomedHeight) / 2; // Center vertically
    
          // Draw the zoomed portion of the video onto the canvas
          context.drawImage(
            videoRef.current,
            offsetX,
            offsetY,
            zoomedWidth,
            zoomedHeight,
            0,
            0,
            canvasWidth,
            canvasHeight
          );
    
          const imageData = canvasRef.current.toDataURL('image/png');
    
          // Convert base64 to File
          try {
            const blob = await (await fetch(imageData)).blob();
            const file = new File([blob], `captured_image_${Date.now()}.png`, { type: 'image/png' });
    
            // Validate file format and size
            if (!SUPPORTED_FORMATS.includes(file.type)) {
              setProfileErrors({
                profile_pic: ['Unsupported file format. Please capture a JPG or PNG image.']
              });
              setCameraOpen(false); // Close modal on validation error
              return;
            }
    
            if (file.size > MAX_FILE_SIZE) {
              setProfileErrors({
                profile_pic: ['File size exceeds 5MB limit.']
              });
              setCameraOpen(false); // Close modal on validation error
              return;
            }
    
            setProfileErrors({
              ...profileErrors,
              profile_pic: undefined
            });
    
            // Upload to Cloudinary and update profile picture
            try {
              const { url } = await uploadImageToCloudinary(file);
              if (url) {
                await updateProfilePicture(url);
                setCameraOpen(false); // Close modal after successful upload
              } else {
                throw new Error('No URL returned from Cloudinary');
              }
            } catch (uploadErr) {
              console.error('Error uploading to Cloudinary:', uploadErr);
              setProfileErrors({
                profile_pic: ['Failed to upload image to Cloudinary. Please try again.']
              });
              setCameraOpen(false); // Close modal on upload error
            }
          } catch (err) {
            console.error('Error processing captured image:', err);
            setProfileErrors({
              profile_pic: ['Failed to process captured image']
            });
            setCameraOpen(false); // Close modal on processing error
          }
        }
      }
    };
  
    const handleCloseCamera = () => {
      setCameraOpen(false); // Close modal; cleanup is handled in useEffect
      setImage(null); // Clear captured image
    };

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
          {isEditing ? (
            <>
              <Button variant="contained" sx={cancelButtonSx} onClick={handleCancel}>
                Cancel
              </Button>
              <Button variant="contained" sx={saveButtonSx} onClick={handleSave}>
                Save
              </Button>
            </>
          ) : (
            <Button 
              variant="contained" 
              sx={saveButtonSx} 
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
          )}
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
                <AvatarContainer isEditing={isEditing}>
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

                  {isEditing && (     
                    <label htmlFor="avatar-upload" style={{ cursor: 'pointer' }}>
                      <AvatarActionButton
                        isEditing={isEditing}
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
                  )}

                  {isEditing && isCurrentUser && (
                        <AvatarActionButton
                          isEditing={isEditing}
                          title="Camera"
                          className="avatar-actions"
                          sx={{
                            top: '55px',
                            right: '-42px',
                          }}
                          onClick={handleOpenCamera}
                        >
                          <MdOutlineMonochromePhotos />
                        </AvatarActionButton>
                      )}

                    <Modal open={cameraOpen} onClose={handleCloseCamera}>
                      <Box
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '80%',
                          maxWidth: '500px',
                          backgroundColor: 'white',
                          borderRadius: '8px',
                          padding: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          boxSizing: 'border-box',
                        }}
                      >
                        <Box
                          sx={{
                            width: '100%',
                            height: 'auto',
                            maxHeight: '400px',
                            overflow: 'hidden', // Ensure zoomed video doesn't overflow
                            borderRadius: '8px',
                          }}
                        >
                          <video
                            ref={videoRef}
                            style={{
                              width: '100%',
                              height: 'auto',
                              borderRadius: '8px',
                              transform: `scale(${zoom})`, // Apply zoom via CSS transform
                              transformOrigin: 'center center', // Zoom from center
                            }}
                            autoPlay
                            playsInline
                            muted
                          />
                        </Box>
                        <canvas ref={canvasRef} style={{ display: 'none' }} width={500} height={500} />
                        <Box sx={{ width: '80%', marginTop: '16px' }}>
                          <Typography id="zoom-slider" gutterBottom>
                            Zoom
                          </Typography>
                          <Slider
                            value={zoom}
                            onChange={(e, newValue) => setZoom(newValue as number)}
                            aria-labelledby="zoom-slider"
                            min={1}
                            max={3}
                            step={0.1}
                            valueLabelDisplay="auto"
                            sx={{ color: '#1A3353' }}
                          />
                        </Box>
                        <Box sx={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                          <Button
                            className="header-button"
                            onClick={handleCloseCamera}
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
                            Close
                          </Button>
                          <Button
                              className="header-button"
                              color="primary"
                              onClick={handleCapture}
                              size="small"
                              variant="contained"
                              startIcon={
                                <PhotoCamera
                                  style={{
                                    fill: 'white',
                                    width: '16px',
                                    marginLeft: '2px',
                                  }}
                                />
                              }
            
                            >
                              Make Photo
                            </Button>
                        </Box>
                      </Box>
                    </Modal>


                  {isEditing && profilePic && (
                    <AvatarActionButton
                      isEditing={isEditing}
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
                    <TextField 
                      name="first_name"
                      value={formData.first_name || ''} 
                      onChange={handleChange}
                      InputProps={{ readOnly: !isEditing }} 
                      placeholder="—" 
                      sx={inputStyles}
                      error={Boolean(profileErrors?.first_name?.[0] || userErrors?.first_name?.[0])}
                      helperText={profileErrors?.first_name?.[0] || userErrors?.first_name?.[0] || ''}
                    />
                  </Box>
                  <Box display="flex" alignItems="center" sx={{ minHeight: 40 }}>
                    <Typography sx={labelStyles}>Email</Typography>
                    <TextField
                      name="email"
                      value={formData.email || ''}
                      onChange={handleChange}
                      InputProps={{ readOnly: !isEditing }}
                      placeholder="sample@example.com"
                      sx={inputStyles}
                      error={Boolean(profileErrors?.email?.[0] || userErrors?.email?.[0])}
                      helperText={profileErrors?.email?.[0] || userErrors?.email?.[0] || ''}
                    />
                  </Box>
                  <Box display="flex" alignItems="center">
                    <Typography sx={labelStyles}>Phone Number</Typography>
                    <TextField
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleChange}
                      InputProps={{ readOnly: !isEditing }}
                      placeholder="—"
                      sx={inputStyles}
                      error={Boolean(profileErrors?.phone?.[0] || userErrors?.phone?.[0])}
                      helperText={profileErrors?.phone?.[0] || userErrors?.phone?.[0] || ''}
                    />
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box display="flex" alignItems="center">
                    <Typography sx={labelStyles}>Last Name</Typography>
                    <TextField 
                      name="last_name"
                      value={formData.last_name || ''} 
                      onChange={handleChange}
                      InputProps={{ readOnly: !isEditing }} 
                      placeholder="—" 
                      sx={inputStyles}
                      error={Boolean(profileErrors?.last_name?.[0] || userErrors?.last_name?.[0])}
                      helperText={profileErrors?.last_name?.[0] || userErrors?.last_name?.[0] || ''}
                    />
                  </Box>
                  <Box display="flex" alignItems="center" sx={{ minHeight: 40 }}>
                    <Typography sx={labelStyles}>Password</Typography>
                    <Button
                      variant="contained"
                      onClick={handleOpen}
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
                      name="alternate_phone"
                      value={formData.alternate_phone || ''}
                      onChange={handleChange}
                      InputProps={{ readOnly: !isEditing }}
                      placeholder="—"
                      sx={inputStyles}
                      error={Boolean(profileErrors?.alternate_phone?.[0] || userErrors?.alternate_phone?.[0])}
                      helperText={profileErrors?.alternate_phone?.[0] || userErrors?.alternate_phone?.[0] || ''}
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
                      name="address_line"
                      value={formData.address_line || ''}
                      onChange={handleChange}
                      InputProps={{ readOnly: !isEditing }}
                      placeholder="—"
                      sx={inputStyles}
                      error={Boolean(profileErrors?.address_line?.[0] || userErrors?.address_line?.[0])}
                      helperText={profileErrors?.address_line?.[0] || userErrors?.address_line?.[0] || ''}
                    />
                  </Box>
                  <Box display="flex" alignItems="center">
                    <Typography sx={labelStyles}>City</Typography>
                    <TextField
                      name="city"
                      value={formData.city || ''}
                      onChange={handleChange}
                      InputProps={{ readOnly: !isEditing }}
                      placeholder="—"
                      sx={inputStyles}
                      error={Boolean(profileErrors?.city?.[0] || userErrors?.city?.[0])}
                      helperText={profileErrors?.city?.[0] || userErrors?.city?.[0] || ''}
                    />
                  </Box>
                  <Box display="flex" alignItems="center">
                    <Typography sx={labelStyles}>Postcode</Typography>
                    <TextField
                      name="postcode"
                      value={formData.postcode || ''}
                      onChange={handleChange}
                      InputProps={{ readOnly: !isEditing }}
                      placeholder="—"
                      sx={inputStyles}
                      error={Boolean(profileErrors?.postcode?.[0] || userErrors?.postcode?.[0])}
                      helperText={profileErrors?.postcode?.[0] || userErrors?.postcode?.[0] || ''}
                    />
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box display="flex" alignItems="center">
                    <Typography sx={labelStyles}>Street</Typography>
                    <TextField
                      name="street"
                      value={formData.street || ''}
                      onChange={handleChange}
                      InputProps={{ readOnly: !isEditing }}
                      placeholder="—"
                      sx={inputStyles}
                      error={Boolean(profileErrors?.street?.[0] || userErrors?.street?.[0])}
                      helperText={profileErrors?.street?.[0] || userErrors?.street?.[0] || ''}
                    />
                  </Box>
                  <Box display="flex" alignItems="center">
                    <Typography sx={labelStyles}>State</Typography>
                    <TextField
                      name="state"
                      value={formData.state || ''}
                      onChange={handleChange}
                      InputProps={{ readOnly: !isEditing }}
                      placeholder="—"
                      sx={inputStyles}
                      error={Boolean(profileErrors?.state?.[0] || userErrors?.state?.[0])}
                      helperText={profileErrors?.state?.[0] || userErrors?.state?.[0] || ''}
                    />
                  </Box>
                  <Box display="flex" alignItems="center">
                    <Typography sx={labelStyles}>Country</Typography>
                    <FormControl sx={{ ...inputStyles, position: 'relative' }}>
                      <Select
                        name="country"
                        value={formData.country || ''}
                        onChange={handleChange}
                        open={countrySelectOpen}
                        onClick={() => isEditing && setCountrySelectOpen(!countrySelectOpen)}
                        displayEmpty
                        inputProps={{ readOnly: !isEditing }}
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
                              pointerEvents: isEditing ? 'auto' : 'none'
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
                        disabled={!isEditing}
                      >
                        {COUNTRIES.map(([code, name]) => (
                          <MenuItem key={code} value={code}>
                            {name}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>
                        {profileErrors?.country?.[0] || userErrors?.country?.[0] || 
                         (user?.address.country_display || '')}
                      </FormHelperText>
                    </FormControl>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Card>

      {/* Password Change Modal */}
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
          <Typography sx={{ fontWeight: 'bold', mb: 2 }}>
            Change Password
          </Typography>
          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              fullWidth
              size="small"
            />
            <TextField
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
              size="small"
            />
            <TextField
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              size="small"
            />

            {profileErrors?.password?.[0] && (
              <Typography color="error" variant="body2">
                {profileErrors.password[0]}
              </Typography>
            )}

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
              <Button variant="outlined" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                variant="contained" 
                onClick={handleChangePassword}
                sx={{ background: '#1976D2' }}
              >
                Change Password
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}