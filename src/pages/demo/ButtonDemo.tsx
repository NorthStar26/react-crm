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
import { SuccessAlert } from '../../components/Button/SuccessAlert';

/**
 * ButtonDemo - A demo page to showcase the reusable button components
 * This page can be accessed via /app/demo/buttons route
 */
export const ButtonDemo: React.FC = () => {
  const [showAlert, setShowAlert] = useState(false);

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
      {/* ← добавить раздел для тестирования SuccessAlert */}
      <Divider sx={{ my: 4 }} />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Success Alert Component
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Test the SuccessAlert component used for notifications
        </Typography>

        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <Button
            variant="contained"
            onClick={() => setShowAlert(true)}
            sx={{ minWidth: 150 }}
          >
            Show Success Alert
          </Button>
          <Button
            variant="outlined"
            onClick={() => setShowAlert(false)}
            sx={{ minWidth: 150 }}
          >
            Close Alert
          </Button>
        </Stack>
      </Box>

      {/* ← добавить компонент SuccessAlert */}
      <SuccessAlert
        open={showAlert}
        message="Company added successfully!"
        onClose={() => setShowAlert(false)}
        autoHideDuration={0} // Отключить автоскрытие для тестирования
      />
    </Container>
  );
};

export default ButtonDemo;
