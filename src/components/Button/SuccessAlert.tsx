// import React from 'react';
// import { Box, Typography, IconButton, Fade } from '@mui/material';
// import { FaCheckCircle, FaTimes } from 'react-icons/fa';

// interface SuccessAlertProps {
//   open: boolean;
//   message: string;
//   onClose: () => void;
//   autoHideDuration?: number;
// }

// export const SuccessAlert: React.FC<SuccessAlertProps> = ({
//   open,
//   message,
//   onClose,
//   autoHideDuration = 2000,
// }) => {
//   React.useEffect(() => {
//     if (open && autoHideDuration > 0) {
//       const timer = setTimeout(() => {
//         onClose();
//       }, autoHideDuration);

//       return () => clearTimeout(timer);
//     }
//   }, [open, autoHideDuration, onClose]);

//   if (!open) return null;

//   return (
//     <Fade in={open}>
//       <Box
//         sx={{
//           position: 'fixed',
//           // bottom: '36px',
//           top: '80%',
//           left: '225',
//           transform: 'translate(-50%, -50%)',
//           zIndex: 9999,
//           backgroundColor: '#4caf50', // Green color
//           color: 'white',
//           borderRadius: '12px',
//           padding: '16px 24px',
//           boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'space-between',
//           minWidth: 250,
//           maxWidth: 350,
//           border: '1px solid #43a047',
//         }}
//       >
//         <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//           <FaCheckCircle size={24} style={{ color: 'white' }} />
//           <Typography
//             variant="h6"
//             sx={{
//               fontWeight: 600,
//               color: 'white',
//               fontSize: '16px',
//             }}
//           >
//             {message}
//           </Typography>
//         </Box>

//         {/* <IconButton
//           onClick={onClose}
//           sx={{
//             color: 'white',
//             ml: 2,
//             p: 0.5,
//             '&:hover': {
//               backgroundColor: 'rgba(255, 255, 255, 0.1)',
//               borderRadius: '50%',
//             },
//           }}
//         >
//           <FaTimes size={16} />
//         </IconButton> */}
//       </Box>
//     </Fade>
//   );
// };
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
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
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

// Вспомогательные компоненты для удобства
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
