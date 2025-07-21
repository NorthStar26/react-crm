import React from 'react';
import { Button, ButtonProps, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

// Базовые стили для всех кнопок pipeline
const BasePipelineButton = styled(Button)({
  width: '164px', // Точная ширина из макета
  height: '46px', // Точная высота из макета
  boxShadow:
    '0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px rgba(0, 0, 0, 0.14), 0px 1px 5px rgba(0, 0, 0, 0.12)',
  borderRadius: '4px', // Точный радиус из макета
  fontFamily: 'Roboto',
  fontStyle: 'normal',
  fontWeight: 500,
  fontSize: '16px',
  lineHeight: '28px',
  letterSpacing: '0.457px',
  textTransform: 'capitalize',
  color: '#FFFFFF',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  '& .MuiButton-startIcon': {
    marginLeft: 0,
    marginRight: '8px',
  },
  '& svg': {
    width: '16px',
    height: '18px',
  },
});

// Кнопка Save
export const SaveButton = styled(BasePipelineButton)({
  backgroundColor: '#1976D2',
  '&:hover': {
    backgroundColor: '#1565C0',
  },
  '&:disabled': {
    backgroundColor: '#1976D2',
    opacity: 0.6,
  },
});

// Кнопка Cancel
export const CancelButton = styled(BasePipelineButton)({
  backgroundColor: '#2B5075',
  '&:hover': {
    backgroundColor: '#1e3a5f',
  },
});

// Компонент кнопки Save с пропсами
interface PipelineSaveButtonProps extends Omit<ButtonProps, 'variant'> {
  saving?: boolean;
}

export function PipelineSaveButton({
  saving,
  children = 'Save',
  ...props
}: PipelineSaveButtonProps) {
  return (
    <SaveButton
      variant="contained"
      startIcon={
        saving ? (
          <CircularProgress size={16} color="inherit" />
        ) : (
          <FaCheckCircle />
        )
      }
      disabled={saving}
      {...props}
    >
      {saving ? 'Saving...' : children}
    </SaveButton>
  );
}

// Компонент кнопки Cancel с пропсами
interface PipelineCancelButtonProps extends Omit<ButtonProps, 'variant'> {}

export function PipelineCancelButton({
  children = 'Cancel',
  ...props
}: PipelineCancelButtonProps) {
  return (
    <CancelButton variant="contained" startIcon={<FaTimesCircle />} {...props}>
      {children}
    </CancelButton>
  );
}
