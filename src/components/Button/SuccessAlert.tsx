import React from 'react';
import { Snackbar, Alert, AlertProps } from '@mui/material';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface SuccessAlertProps {
  open: boolean;
  message: string;
  onClose: () => void;
  autoHideDuration?: number;
  type?: AlertType;
  showCloseButton?: boolean;
}

export const SuccessAlert: React.FC<SuccessAlertProps> = ({
  open,
  message,
  onClose,
  autoHideDuration = 2000,
  type = 'success',
  showCloseButton = false,
}) => {
  // Обработка закрытия
  const handleClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway' && !showCloseButton) {
      return;
    }

    onClose();
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    >
      <Alert
        onClose={showCloseButton ? handleClose : undefined}
        severity={type}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

// Helper components for convenience
export const ErrorAlert = (props: Omit<SuccessAlertProps, 'type'>) => (
  <SuccessAlert
    {...props}
    type="error"
    autoHideDuration={5000}
    showCloseButton={true}
  />
);

export const WarningAlert = (props: Omit<SuccessAlertProps, 'type'>) => (
  <SuccessAlert {...props} type="warning" showCloseButton={true} />
);

export const InfoAlert = (props: Omit<SuccessAlertProps, 'type'>) => (
  <SuccessAlert {...props} type="info" />
);
