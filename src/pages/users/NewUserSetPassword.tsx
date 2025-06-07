import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Grid, Stack, Typography, TextField, Button, Alert } from "@mui/material";
import imgLogo from '../../assets/images/auth/img_logo.png';
import imgLogin from '../../assets/images/auth/img_login.png';
import backGroundImage from '../../assets/images/auth/newBackGroundImage.jpg';
import newLogo from '../../assets/images/auth/newLogo.png'; 
import { ActivateAccountUrl } from '../../services/ApiUrls';
import { fetchData } from '../../components/FetchData';

// Add parseResponse utility function
function parseResponse(res: any): { success: boolean, error: string | null } {
  if (!res) return { success: false, error: "No response from server." };
  if (res.success) return { success: true, error: null };
  if (res.error) return { success: false, error: res.error };
  if (typeof res === "string") return { success: false, error: res };
  return { success: false, error: "Invalid activation key." };
}

const NewUserSetPassword: React.FC = () => {
  const { activationKey } = useParams<{ activationKey: string }>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Check for missing activation key when component mounts
  useEffect(() => {
    if (!activationKey) {
      setError("Invalid activation link. Activation key is missing.");
    }
  }, [activationKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Guard against missing activation key
    if (!activationKey) {
      setError("Invalid activation link. Activation key is missing.");
      return;
    }

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

      // Parse response using utility function
      const { success: isSuccess, error: errorMessage } = parseResponse(res);
      setSuccess(isSuccess);
      setError(errorMessage);
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
          xs={6.4}
          direction='column'
          justifyContent='center'
          alignItems='center'
          className='rightBg'
          sx={{ height: '100%', overflow: 'hidden', justifyItems: 'center' }}
        >
          <Grid item>
            <Stack sx={{ alignItems: 'center' }}>
                <img
                src={newLogo}
                alt='register_ad_image'
                className='register-ad-image'
                style={{  width: '100%' ,maxHeight: '40px' }}
                />
            </Stack>
          </Grid>
        </Grid>
        <Grid
          container
          item
          xs={9.6}
          direction='column'
          justifyContent='space-evenly'
          alignItems='center'
          sx={{ height: '100%', overflow: 'hidden' }}
        >
          
          <Grid item>
            
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
                  sx={{ 
                    fontWeight: 500, 
                    py: 1, 
                    width: '120px', 
                    alignSelf: 'flex-end' 
                  }}
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Next"}
                </Button>
              </Stack>
            </form>
          </Grid>
        </Grid>
        
      </Stack>
    </div>
  );
};

export default NewUserSetPassword;