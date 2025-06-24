import { useEffect, useState } from 'react';
import {
  Grid,
  Stack,
  Typography,
  TextField,
  Button,
  Box,
  Divider,
  Link,
} from '@mui/material';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import imgGoogle from '../../assets/images/auth/google.svg';
import imgLogo from '../../assets/images/auth/img_logo.png';
import imgLogin from '../../assets/images/auth/img_login.png';
import { GoogleButton } from '../../styles/CssStyled';
import { fetchData } from '../../components/FetchData';
import { AuthUrl } from '../../services/ApiUrls';
import '../../styles/style.css';

declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

export default function Login() {
  const navigate = useNavigate();
  const [token, setToken] = useState(false);

  // Add states for the login form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('Token')) {
      // navigate('/organization')
      navigate('/app');
    }
  }, [token]);

  // Email and password login handler
  const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);

    try {
      const head = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };
      const body = JSON.stringify({ email, password });

      try {
        const res = await fetchData('auth/login/', 'POST', body, head);

        localStorage.setItem('Token', `Bearer ${res.access}`);
        localStorage.setItem('refresh_token', res.refresh);

        // 2. Get org from profile
        const profile = await fetchData('profile/', 'GET', null as any, {
          Authorization: `Bearer ${res.access}`,
        });

        if (profile.org) {
          localStorage.setItem('org', profile.org);
        }

        // 3. Set the token to the state
        setToken(true);
      } catch (error: any) {
        console.error('Login failed:', error);

        // Direct error handling from the backend
        if (error.status === 400 && error.data) {
          // Check for email/password errors from CustomTokenObtainPairSerializer
          if (error.data.email) {
            // Backend returned: {"email": "User with this email not found"}
            setLoginError(error.data.email);
            return;
          }

          if (error.data.password) {
            // Backend returned: {"password": "Invalid password"}
            setLoginError(error.data.password);
            return;
          }

          // Common errors
          if (error.data.detail) {
            setLoginError(error.data.detail);
            return;
          }
        }

        // Specific error codes
        if (error.status === 403 || error.status === 429) {
          setLoginError('Too many login attempts. Please try again later.');
          return;
        }

        // For all other errors
        setLoginError('Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      setLoading(true);
      const apiToken = { token: tokenResponse.access_token };
      const head = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };
      fetchData(`${AuthUrl}/`, 'POST', JSON.stringify(apiToken), head)
        .then((res: any) => {
          localStorage.setItem('res', JSON.stringify(res));
          localStorage.setItem('Token', `Bearer ${res.access_token}`);
          setToken(true);
        })
        .catch((error: any) => {
          console.error('Error:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    },
    onError: () => {
      setLoginError('Google authentication failed');
    },
  });

  return (
    <div>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="center"
        alignItems="center"
        sx={{ height: '100%', width: '100%', position: 'fixed' }}
      >
        {/* Background image (left) - resize by 45% */}
        <Grid
          container
          item
          xs={12} // On mobile devices, full width
          sm={5} // On small screens ~33%
          md={4.5} // On medium and large screens 35%
          direction="column"
          justifyContent="center"
          alignItems="center"
          className="leftBg"
          sx={{
            height: '100%',
            overflow: 'hidden',
            justifyItems: 'center',
          }}
        >
          <Grid item>
            <Stack sx={{ alignItems: 'center' }}>
              <footer className="register-footer">bottlecrm.com</footer>
            </Stack>
          </Grid>
        </Grid>

        {/* Authorization form (right) -  55% */}
        <Grid
          container
          item
          xs={12} // On mobile devices, full width
          sm={7} // On small screens ~67%
          md={7.5} // On medium and large screens 65%
          direction="column"
          justifyContent="center" // Changed from space-evenly to center
          alignItems="center"
          sx={{ height: '100%', overflow: 'hidden', bgcolor: '#ffffff' }}
        >
          <Grid item>
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                fontSize: '21.26px',
                lineHeight: '29.23px',
                letterSpacing: '0%',
                marginBottom: '20px',
                verticalAlign: 'middle',
                textAlign: 'left', //
              }}
            >
              Login
            </Typography>

            {/* Login form by email and password */}
            <Box
              component="form"
              onSubmit={handleEmailLogin}
              sx={{ width: '320px', mb: 3 }}
            >
              {loginError && (
                <Typography
                  color="error"
                  variant="body2"
                  sx={{ mb: 2, textAlign: 'center' }}
                >
                  {loginError}
                </Typography>
              )}

              <TextField
                fullWidth
                label="Email Address"
                type="email"
                variant="outlined"
                margin="normal"
                sx={{
                  backgroundColor: '#F2F4F7',
                  borderRadius: '6.64px',
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      border: 'none', // Remove border in normal state
                    },
                    '&:hover fieldset': {
                      border: 'none', // Remove border on hover
                    },
                    '&.Mui-focused fieldset': {
                      border: 'none', // Remove border on focus
                    },
                  },
                }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <TextField
                fullWidth
                label="Password"
                type="password"
                variant="outlined"
                margin="normal"
                sx={{
                  backgroundColor: '#F2F4F7',
                  borderRadius: '6.64px',
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      border: 'none', // Remove border in normal state
                    },
                    '&:hover fieldset': {
                      border: 'none', // Remove border on hover
                    },
                    '&.Mui-focused fieldset': {
                      border: 'none', // Remove border on focus
                    },
                  },
                }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Typography
                variant="body2"
                color="textPrimary"
                sx={{
                  mt: 1,
                  textAlign: 'left',
                }}
              >
                Forgot your{' '}
                <Link
                  component="span"
                  onClick={() => navigate('/auth/reset-password')}
                  sx={{
                    color: 'blue',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Password
                </Link>
                ?
              </Typography>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={loading} // this is to disable the button during loading
                sx={{
                  mt: 2,
                  py: 1.2,
                  borderRadius: '4px',
                  textTransform: 'none',
                  fontWeight: 500,
                  display: 'block',
                  margin: '32px auto 0',
                  width: '100%',
                }}
              >
                {loading ? 'Signing In...' : 'Sign In'}{' '}
                {/* Or use CircularProgress */}
              </Button>
            </Box>

            <Divider sx={{ width: '320px', my: 2 }}>
              <Typography variant="body2" color="textSecondary">
                OR
              </Typography>
            </Divider>

            <Grid
              item
              sx={{
                mt: 1,
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
                borderRadius: '7px',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    border: 'none', // Remove the frame in its normal state
                  },
                  '&:hover fieldset': {
                    border: 'none', // we remove the frame on hover
                  },
                  '&.Mui-focused fieldset': {
                    border: 'none', // Remove frame on focus
                  },
                },
              }}
            >
              <GoogleButton
                variant="outlined"
                onClick={() => login()}
                disabled={loading} //Add this attribute
                sx={{
                  fontSize: '12px',
                  fontWeight: 500,
                  width: '320px', // Setting the width to fit the shape above
                  backgroundColor: '#F2F4F7',
                  borderRadius: '5px',
                  // Specific styles for Button
                  border: 'none !important',
                  '&.MuiButton-outlined': {
                    border: 'none',
                  },
                  '&.MuiButton-root': {
                    border: 'none',
                  },
                }}
              >
                Sign in with Google
                <img
                  src={imgGoogle}
                  alt="google"
                  style={{ width: '17px', marginLeft: '5px' }}
                />
              </GoogleButton>
            </Grid>
          </Grid>
        </Grid>
      </Stack>
    </div>
  );
}
