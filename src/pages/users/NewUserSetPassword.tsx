import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Grid, Stack, Typography, TextField, Button, Alert } from "@mui/material";
import imgLogo from '../../assets/images/auth/img_logo.png';
import imgLogin from '../../assets/images/auth/img_login.png';
import { ActivateAccountUrl } from '../../services/ApiUrls';
import { fetchData } from '../../components/FetchData';

const NewUserSetPassword: React.FC = () => {
  const { activationKey } = useParams<{ activationKey: string }>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'activation-key': activationKey 
      };
      const body = JSON.stringify({
        email,
        password,
        confirm_password: confirmPassword
      });
      const res = await fetchData(`${ActivateAccountUrl}/`, 'POST', body, headers);

      // More reliable success/error detection
      if (
        (res && res.status && res.status >= 200 && res.status < 300) || 
        (res && res.success === true) ||
        (res && res.message && typeof res.message === "string" && 
         res.message.toLowerCase().includes("success"))
      ) {
        setSuccess(true);
        setError(null);
      } else {
        // Process different error response formats
        if (res && res.detail) {
          setError(res.detail);
        } else if (res && res.error) {
          setError(typeof res.error === 'string' ? res.error : "Failed to set password.");
        } else if (res && res.message && !res.success) {
          setError(res.message);
        } else if (res && res.non_field_errors) {
          setError(Array.isArray(res.non_field_errors) ? res.non_field_errors[0] : res.non_field_errors);
        } else {
          setError("Failed to set password. Please try again.");
        }
        setSuccess(false);
      }
    } catch (err: any) {
      console.error("Password reset error:", err);
      setError(err?.message || "Failed to connect to server. Please check your internet connection.");
      setSuccess(false);
    }
    setLoading(false);
  };

  return (
    <div>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent='center'
        alignItems='center'
        sx={{ height: '100%', width: '100%', position: 'fixed' }}
      >
        <Grid
          container
          item
          xs={8}
          direction='column'
          justifyContent='space-evenly'
          alignItems='center'
          sx={{ height: '100%', overflow: 'hidden' }}
        >
          <Grid item>
            <Grid sx={{ mt: 2 }}>
              <img src={imgLogo} alt='register_logo' className='register-logo' />
            </Grid>
            <Typography variant='h5' style={{ fontWeight: 'bolder', marginTop: 16 }}>
              Set Your Password
            </Typography>
            <form onSubmit={handleSubmit}>
              <Stack spacing={2} sx={{ mt: 4, minWidth: 300 }}>
                {error && <Alert severity="error">{error}</Alert>}
                {success && <Alert severity="success">Password set successfully!</Alert>}
                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  required
                  onChange={e => setEmail(e.target.value)}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  required
                  onChange={e => setPassword(e.target.value)}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  required
                  onChange={e => setConfirmPassword(e.target.value)}
                  fullWidth
                  size="small"
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ fontWeight: 500, py: 1.2 }}
                  fullWidth
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Confirm"}
                </Button>
              </Stack>
            </form>
          </Grid>
        </Grid>
        <Grid
          container
          item
          xs={8}
          direction='column'
          justifyContent='center'
          alignItems='center'
          className='rightBg'
          sx={{ height: '100%', overflow: 'hidden', justifyItems: 'center' }}
        >
          <Grid item>
            <Stack sx={{ alignItems: 'center' }}>
              <h3>Welcome to BottleCRM</h3>
              <p> Free and OpenSource CRM from small medium business.</p>
              <img
                src={imgLogin}
                alt='register_ad_image'
                className='register-ad-image'
              />
              <footer className='register-footer'>
                bottlecrm.com
              </footer>
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </div>
  );
};

export default NewUserSetPassword;