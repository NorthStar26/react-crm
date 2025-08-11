import React, { ChangeEvent, useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaTrashAlt } from 'react-icons/fa';
import { ValidationModule } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { PhotoCamera, Delete, Upload } from '@mui/icons-material';
import {
  ColumnAutoSizeModule,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  RowAutoHeightModule,
  CellStyleModule
} from 'ag-grid-community';

ModuleRegistry.registerModules([
  ColumnAutoSizeModule,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  RowAutoHeightModule,
  CellStyleModule
]);

ModuleRegistry.registerModules([ValidationModule]);

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
import { useUser } from '../../context/UserContext';
import { FiChevronDown } from '@react-icons/all-files/fi/FiChevronDown';
import { FiChevronUp } from '@react-icons/all-files/fi/FiChevronUp';
import { COUNTRIES } from '../../data/countries';
import '../../styles/style.css';
import { Badge } from '@mui/material';
import { uploadImageToCloudinary } from '../../utils/uploadImageToCloudinary';

const SUPPORTED_FORMATS = ['image/jpg', 'image/jpeg', 'image/png'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

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
}

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

export function EditUser() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user, loadUserProfile } = useUser();

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

  // use camera for user's avatar
  const [cameraOpen, setCameraOpen] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1); // Default zoom level is 1 (no zoom)
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

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
  }, [cameraOpen]); // Run effect when cameraOpen changes

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

  const getEditDetail = (id: any) => {
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('Token') || '',
      org: localStorage.getItem('org') || '',
    };

    fetchData(`${UserUrl}/${id}/`, 'GET', null as any, headers)
      .then((res: any) => {
        if (!res.error) {
          const data = res?.data?.profile_obj;
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
          });
        }
        if (res.error) {
          setError(true);
        }
      })
      .catch(() => {});
  };

  const submitForm = () => {
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: localStorage.getItem('Token') || '',
      org: localStorage.getItem('org') || '',
    };

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
    };

    fetchData(`${UserUrl}/${state?.id}/`, 'PUT', JSON.stringify(data), headers)
      .then(async (res: any) => {

        if (!res.error) {
          setInfoMessage('User updated successfully');
          setSuccessMessage(true);

          setTimeout(() => {
            setSuccessMessage(false);

            const currentUserId = user?.user_details?.id?.toString();
            const editedUserId = state?.id?.toString();
            // if the user being edited is the current logged-in user, refresh the context
            if (
              user &&
              currentUserId &&
              editedUserId &&
              currentUserId === editedUserId
            ) {
              window.location.href = '/app/users';
            } else {
              navigate('/app/users');
            }
          }, 2000); // 2 seconds delay before redirecting

          resetForm();
          return;
        }




        // if (!res.error) {
        //   resetForm();

        //   // If the user being edited is the current logged-in user, refresh the context
        //   // Convert both IDs to strings for comparison to avoid type mismatch
        //   const currentUserId = user?.user_details?.id?.toString();
        //   const editedUserId = state?.id?.toString();

        //   console.log('Current user ID:', currentUserId);
        //   console.log('Edited user ID:', editedUserId);
        //   console.log('IDs match:', currentUserId === editedUserId);

        //   if (
        //     user &&
        //     currentUserId &&
        //     editedUserId &&
        //     currentUserId === editedUserId
        //   ) {
        //     console.log(
        //       'User edited their own profile - refreshing page to update all components...'
        //     );
        //     // When user edits their own profile, refresh the page to ensure all components update
        //     window.location.href = '/app/users';
        //     return;
        //   }

        //   navigate('/app/users');
        // }




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
    });
    setProfileErrors({});
    setUserErrors({});
  };

  const onCancel = () => {
    setReset(true);
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

    setProfileErrors({
      ...profileErrors,
      profile_pic: undefined
    });

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
        `${UserUrl}/${state?.id}/image/`,
        'PUT',
        JSON.stringify({ profile_pic: '', email: formData.email }),
        headers
      );

      if (!response.error) {
        setFormData({ ...formData, profile_pic: null });
        setInfoMessage('Profile picture removed successfully!');
        setSuccessMessage(true);
        setTimeout(() => {
          setSuccessMessage(false);
        }, 3000);
        return;
      }

      const nullResponse = await fetchData(
        `${UserUrl}/${state?.id}/image/`,
        'PUT',
        JSON.stringify({ profile_pic: null, email: formData.email }),
        headers
      );

      if (!nullResponse.error) {
        setFormData({ ...formData, profile_pic: null });
        setInfoMessage('Profile picture removed successfully!');
        setSuccessMessage(true);
        setTimeout(() => {
          setSuccessMessage(false);
        }, 3000);
      } else {
        throw new Error('Failed to remove profile picture');
      }
    } catch (err) {
      console.error('Error removing profile picture:', err);
      setProfileErrors({
        profile_pic: ['Failed to remove profile picture'],
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
        `${UserUrl}/${state?.id}/image/`,
        'PUT',
        JSON.stringify({ profile_pic: url, email: formData.email }),
        headers
      );

      if (!response.error) {
        setFormData({ ...formData, profile_pic: url });
        setInfoMessage('Profile picture updated successfully!');
        setSuccessMessage(true);
        setTimeout(() => {
          setSuccessMessage(false);
        }, 3000);
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      console.error('Error updating profile picture:', err);
      setProfileErrors({
        profile_pic: ['Failed to update profile picture'],
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
      Authorization: localStorage.getItem('Token') || '',
      org: localStorage.getItem('org') || '',
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

  const module = 'Users';
  const crntPage = 'Edit User';
  const backBtn = state?.edit ? 'Back To Users' : 'Back To UserDetails';


  // isCurrentUser
  const isCurrentUser =
    user && user.user_details?.id?.toString() === state?.id?.toString();


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
          {/* from here */}
          <Snackbar
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            autoHideDuration={5000}
            onClose={() => setSuccessMessage(false)}
            open={successMessage}
            message={info_message}
            ContentProps={{
              sx: {
                backgroundColor: '#4caf50',
                color: '#fff',
              }
            }}
          />
          {/* to here */}
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
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    <AvatarContainer>
                      <Avatar
                        src={formData.profile_pic || ''}
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

                      {isCurrentUser && (
                        <AvatarActionButton
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

                      {formData.profile_pic && (
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
                        {isCurrentUser && (
                          <div className="fieldTitle">Password</div>
                        )}
                        {/* add change password button */}
                        {/*  */}
                        {isCurrentUser && (
                          <Button
                            variant="contained"
                            onClick={() => handleOpen()}
                          >
                            Change Password
                          </Button>
                        )}

                        {/* Role management for other users */}
                        {!isCurrentUser && (
                          <>
                            <div className="fieldTitle">Role</div>
                            <FormControl sx={{ width: '70%' }}>
                              <Select
                                name="role"
                                value={formData.role}
                                open={roleSelectOpen}
                                onClick={() => setRoleSelectOpen(!roleSelectOpen)}
                                IconComponent={() => (
                                  <div
                                    onClick={() =>
                                      setRoleSelectOpen(!roleSelectOpen)
                                    }
                                    className="select-icon-background"
                                  >
                                    {roleSelectOpen ? (
                                      <FiChevronUp className="select-icon" />
                                    ) : (
                                      <FiChevronDown className="select-icon" />
                                    )}
                                  </div>
                                )}
                                className={'select'}
                                onChange={handleChange}
                                error={!!errors?.role?.[0]}
                              >
                                {['ADMIN','MANAGER', 'USER'].map((option) => (
                                  <MenuItem key={option} value={option}>
                                    {option}
                                  </MenuItem>
                                ))}
                              </Select>
                              <FormHelperText>
                                {errors?.role?.[0] || profileErrors?.role?.[0] || userErrors?.role?.[0] || ''}
                              </FormHelperText>
                            </FormControl>
                          </>
                        )}
                        {/* add change password button */}

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
                                formData.alternate_phone !== '')
                            }
                            helperText={
                              profileErrors?.alternate_phone?.[0] ||
                              userErrors?.alternate_phone?.[0] ||
                              (formData.phone === formData.alternate_phone &&
                              formData.alternate_phone !== ''
                                ? 'Phone number and alternate phone number cannot be the same.'
                                : '')
                            }
                          />
                        </Tooltip>
                      </div>
                    </div>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </div>

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
          </div>
        </form>
      </Box>
    </Box>
  );
}