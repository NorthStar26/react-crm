import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Grid, Stack, Typography, TextField, Button, Box } from "@mui/material";
import { ActivateAccountUrl } from '../../services/ApiUrls';
import { fetchData } from '../../components/FetchData';
import '../../styles/style.css';

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
  const navigate = useNavigate();
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
      
      // Navigate to login page after successful password setup
      if (isSuccess) {
        setTimeout(() => {
          navigate('/login');
        },1500); // Wait 2 seconds to show success message
      }
    } catch (err: any) {
      console.error("Password reset error:", err);
      if (err?.data?.password && Array.isArray(err.data.password)) {
        setError(err.data.password.join(', '));
      } else {
        setError(err?.message || "Failed to set password. Please try again.");
      }
      setSuccess(false);
    }
    setLoading(false);
  };

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
                textAlign: 'left',
              }}
            >
              Set Your Password
            </Typography>

            {/* Password setup form */}
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
                  Password set successfully!
                </Typography>
              )}

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

              <TextField
                fullWidth
                label="Confirm Password"
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
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                {loading ? "Setting Password..." : "Set Password"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Stack>
    </div>
  );
};

export default NewUserSetPassword;