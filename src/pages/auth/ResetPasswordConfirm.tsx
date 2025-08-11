import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Grid, Stack, Typography, TextField, Button, Box } from '@mui/material';
import { PasswordResetConfirmUrl } from '../../services/ApiUrls';
import { fetchData } from '../../components/FetchData';
import '../../styles/style.css';

const ResetPasswordConfirm: React.FC = () => {
  const { uidb64, token } = useParams<{ uidb64: string; token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Check for missing parameters when component mounts
  useEffect(() => {
    if (!uidb64 || !token) {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [uidb64, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Guard against missing parameters
    if (!uidb64 || !token) {
      setError('Invalid reset link. Please request a new password reset.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };
      const body = JSON.stringify({
        uidb64,
        token,
        password,
        confirm_password: confirmPassword,
      });

      const res = await fetchData(
        `${PasswordResetConfirmUrl}/`,
        'POST',
        body,
        headers
      );

      if (res.success) {
        setSuccess(true);
        setError(null);

        // Navigate to login page after successful password reset
        setTimeout(() => {
          navigate('/login');
        }, 4000); // Wait 4 seconds to show success message
      } else {
        setSuccess(false);

        // Check the nested structure of the message
        if (typeof res.message === 'object' && res.message !== null) {
          // If message is an object with a password field
          if (res.message.password) {
            setError(
              Array.isArray(res.message.password)
                ? res.message.password.join(', ')
                : res.message.password
            );
          } else {
            // For other nested error fields
            const firstErrorField = Object.keys(res.message)[0];
            if (firstErrorField) {
              const firstError = res.message[firstErrorField];
              setError(
                Array.isArray(firstError) ? firstError.join(', ') : firstError
              );
            } else {
              setError('Failed to reset password. Please try again.');
            }
          }
        } else {
          // If message is a string or other type
          setError(
            res.message || 'Failed to reset password. Please try again.'
          );
        }
      }
    } catch (err: any) {
      setSuccess(false);

      if (err.responseText) {
        try {
          const parsedError = JSON.parse(err.responseText);
          if (parsedError.message?.password) {
            setError(
              Array.isArray(parsedError.message.password)
                ? parsedError.message.password.join(', ')
                : parsedError.message.password
            );
            return;
          }
        } catch (parseErr) {
          setError(err.responseText);
          return;
        }
      }
      // 2. If there is err.data (for example, if fetchData parses JSON)
      if (err.data?.message?.password) {
        setError(
          Array.isArray(err.data.message.password)
            ? err.data.message.password.join(', ')
            : err.data.message.password
        );
        return;
      }
      // Handle other errors
      setError(err?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="center"
        alignItems="center"
        sx={{ height: '100%', width: '100%', position: 'fixed' }}
      >
        {/* Background image (left) */}
        <Grid
          container
          item
          xs={12}
          sm={5}
          md={4.5}
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

        {/* Form (right) */}
        <Grid
          container
          item
          xs={12}
          sm={7}
          md={7.5}
          direction="column"
          justifyContent="center"
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
                textAlign: 'left',
              }}
            >
              Reset Your Password
            </Typography>

            {/* Password reset confirmation form */}
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ width: '320px', mb: 3 }}
            >
              {error && (
                <Typography
                  color="error"
                  variant="body2"
                  sx={{ mb: 2, textAlign: 'center' }}
                >
                  {error}
                </Typography>
              )}

              {success && (
                <Typography
                  color="success.main"
                  variant="body2"
                  sx={{ mb: 2, textAlign: 'center' }}
                >
                  Password has been reset successfully! You will be redirected
                  to the login page.
                </Typography>
              )}

              {!success && (
                <>
                  <TextField
                    fullWidth
                    label="New Password"
                    type="password"
                    variant="outlined"
                    margin="normal"
                    sx={{
                      backgroundColor: '#F2F4F7',
                      borderRadius: '6.64px',
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          border: 'none',
                        },
                        '&:hover fieldset': {
                          border: 'none',
                        },
                        '&.Mui-focused fieldset': {
                          border: 'none',
                        },
                      },
                    }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />

                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    type="password"
                    variant="outlined"
                    margin="normal"
                    sx={{
                      backgroundColor: '#F2F4F7',
                      borderRadius: '6.64px',
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          border: 'none',
                        },
                        '&:hover fieldset': {
                          border: 'none',
                        },
                        '&.Mui-focused fieldset': {
                          border: 'none',
                        },
                      },
                    }}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    disabled={loading || !uidb64 || !token}
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
                    {loading ? 'Resetting Password...' : 'Reset Password'}
                  </Button>
                </>
              )}
            </Box>
          </Grid>
        </Grid>
      </Stack>
    </div>
  );
};

export default ResetPasswordConfirm;
