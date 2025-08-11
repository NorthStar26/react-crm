import React, { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Button,
  Stack,
  Divider,
} from '@mui/material';
import { ButtonExamples } from '../../components/Button/ButtonExamples';
import {
  SuccessAlert,
  ErrorAlert,
  WarningAlert,
  InfoAlert,
} from '../../components/Button/SuccessAlert';

/**
 * ButtonDemo - A demo page to showcase the reusable button components
 * This page can be accessed via /app/demo/buttons route
 */
export const ButtonDemo: React.FC = () => {
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [showWarningAlert, setShowWarningAlert] = useState(false);
  const [showInfoAlert, setShowInfoAlert] = useState(false);

  return (
    <Container maxWidth="lg" sx={{ py: 4, p: 20 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Button Component Demo
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Explore our reusable button components built with Material-UI and
          emotion styled
        </Typography>
      </Box>

      <ButtonExamples />

      {/* Alert Components Section */}
      <Divider sx={{ my: 4 }} />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Alert Components
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Test the different alert components based on MUI Snackbar
        </Typography>

        {/* Success Alert */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Success Alert
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Button
              variant="contained"
              color="success"
              onClick={() => setShowSuccessAlert(true)}
              sx={{ minWidth: 150 }}
            >
              Show Success
            </Button>
            <Button
              variant="outlined"
              onClick={() => setShowSuccessAlert(false)}
              sx={{ minWidth: 150 }}
            >
              Close Success
            </Button>
          </Stack>
        </Box>

        {/* Error Alert */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Error Alert
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Button
              variant="contained"
              color="error"
              onClick={() => setShowErrorAlert(true)}
              sx={{ minWidth: 150 }}
            >
              Show Error
            </Button>
            <Button
              variant="outlined"
              onClick={() => setShowErrorAlert(false)}
              sx={{ minWidth: 150 }}
            >
              Close Error
            </Button>
          </Stack>
        </Box>

        {/* Warning Alert */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Warning Alert
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Button
              variant="contained"
              color="warning"
              onClick={() => setShowWarningAlert(true)}
              sx={{ minWidth: 150 }}
            >
              Show Warning
            </Button>
            <Button
              variant="outlined"
              onClick={() => setShowWarningAlert(false)}
              sx={{ minWidth: 150 }}
            >
              Close Warning
            </Button>
          </Stack>
        </Box>

        {/* Info Alert */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Info Alert
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Button
              variant="contained"
              color="info"
              onClick={() => setShowInfoAlert(true)}
              sx={{ minWidth: 150 }}
            >
              Show Info
            </Button>
            <Button
              variant="outlined"
              onClick={() => setShowInfoAlert(false)}
              sx={{ minWidth: 150 }}
            >
              Close Info
            </Button>
          </Stack>
        </Box>

        {/* Test All Alerts */}
        <Divider sx={{ my: 3 }} />
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Test All Alerts
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              onClick={() => {
                setShowSuccessAlert(true);
                setTimeout(() => setShowErrorAlert(true), 500);
                setTimeout(() => setShowWarningAlert(true), 1000);
                setTimeout(() => setShowInfoAlert(true), 1500);
              }}
              sx={{ minWidth: 150 }}
            >
              Show All Alerts
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                setShowSuccessAlert(false);
                setShowErrorAlert(false);
                setShowWarningAlert(false);
                setShowInfoAlert(false);
              }}
              sx={{ minWidth: 150 }}
            >
              Close All Alerts
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Alert Components */}
      <SuccessAlert
        open={showSuccessAlert}
        message="Company added successfully!"
        onClose={() => setShowSuccessAlert(false)}
        autoHideDuration={2000}
      />

      <ErrorAlert
        open={showErrorAlert}
        message="Failed to delete company. Please try again."
        onClose={() => setShowErrorAlert(false)}
      />

      <WarningAlert
        open={showWarningAlert}
        message="Please save your changes before leaving."
        onClose={() => setShowWarningAlert(false)}
      />

      <InfoAlert
        open={showInfoAlert}
        message="New features are available in this version."
        onClose={() => setShowInfoAlert(false)}
        autoHideDuration={3000}
      />
    </Container>
  );
};

export default ButtonDemo;
