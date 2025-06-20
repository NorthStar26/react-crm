import React, { useState } from 'react';
import { Grid, Stack, Typography, TextField, Button, Box } from '@mui/material';
import { PasswordResetUrl } from '../../services/ApiUrls';
import { fetchData } from '../../components/FetchData';
import '../../styles/style.css';

const RequestPasswordReset: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!email) {
      setError('Email is required.');
      return;
    }

    setLoading(true);
    try {
      const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };
      const body = JSON.stringify({ email });
      const res = await fetchData(
        `${PasswordResetUrl}/`,
        'POST',
        body,
        headers
      );

      if (res.success) {
        setSuccess(true);
        setError(null);
      } else {
        setSuccess(false);
        if (typeof res.message === 'object' && res.message !== null) {
          const firstField = Object.keys(res.message)[0];
          if (firstField) {
            const firstError = res.message[firstField];
            setError(
              Array.isArray(firstError) ? firstError.join(', ') : firstError
            );
          } else {
            setError('Failed to send reset link. Please try again.');
          }
        } else {
          setError(
            res.message || 'Failed to send reset link. Please try again.'
          );
        }
      }
    } catch (err: any) {
      if (err?.status === 429 || err?.status === 403) {
        setError('Too many attempts. Please try again later.');
      } else {
        setError(
          err?.message || 'Failed to send reset link. Please try again.'
        );
      }
      setSuccess(false);
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

            {/* Password reset request form */}
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
                  If your email exists in our system, you will receive a
                  password reset link shortly.
                </Typography>
              )}

              {!success && (
                <>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Enter your email address and we'll send you a link to reset
                    your password.
                  </Typography>

                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    disabled={loading}
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
                    {loading ? 'Sending...' : 'Send Reset Link'}
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

export default RequestPasswordReset;
