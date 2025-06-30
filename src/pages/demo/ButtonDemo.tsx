import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { ButtonExamples } from '../../components/Button/ButtonExamples';

/**
 * ButtonDemo - A demo page to showcase the reusable button components
 * This page can be accessed via /app/demo/buttons route
 */
export const ButtonDemo: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4,p:20 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Button Component Demo
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Explore our reusable button components built with Material-UI and emotion styled
        </Typography>
      </Box>
      
      <ButtonExamples />
    </Container>
  );
};

export default ButtonDemo;
