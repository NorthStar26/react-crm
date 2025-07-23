import React from 'react';
import {
  Snackbar,
  Alert,
  AlertProps,
  Box,
  LinearProgress,
} from '@mui/material';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface SuccessAlertProps {
  open: boolean;
  message: string;
  onClose: () => void;
  autoHideDuration?: number;
  type?: AlertType;
  showCloseButton?: boolean;
  showProgress?: boolean; // для отображения прогресса при переходе между этапами
  position?: {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };
}

export const SuccessAlert: React.FC<SuccessAlertProps> = ({
  open,
  message,
  onClose,
  autoHideDuration = 2000,
  type = 'success',
  showCloseButton = false,
  showProgress = false,
  position = { vertical: 'bottom', horizontal: 'left' },
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
      anchorOrigin={position}
    >
      <Alert
        onClose={showCloseButton ? handleClose : undefined}
        severity={type}
        variant="filled"
        sx={{ width: '100%' }}
      >
        <Box>
          {message}
          {showProgress && (
            <LinearProgress
              sx={{
                mt: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                },
              }}
            />
          )}
        </Box>
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

// Pipeline specific alerts
export const PipelineSuccessAlert = (
  props: Omit<SuccessAlertProps, 'type' | 'position'>
) => (
  <SuccessAlert
    {...props}
    type="success"
    position={{ vertical: 'top', horizontal: 'center' }}
    autoHideDuration={3000}
  />
);

export const PipelineTransitionAlert = (
  props: Omit<SuccessAlertProps, 'type' | 'showProgress'>
) => (
  <SuccessAlert
    {...props}
    type="success"
    showProgress={true}
    autoHideDuration={4000}
    position={{ vertical: 'top', horizontal: 'center' }}
  />
);
