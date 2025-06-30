import styled from '@emotion/styled';
import { Button, IconButton, Fab, CircularProgress } from '@mui/material';
import { ButtonVariant, ButtonSize, ButtonShape } from './types';

// Helper function to get button colors based on variant
const getButtonColors = (variant: ButtonVariant) => {
  const colors = {
    primary: {
      bg: '#1976D2',
      hover: '#1565C0',
      color: '#FFFFFF',
      border: '#1976D2'
    },
    secondary: {
      bg: '#1A3353',
      hover: '#0F2A55',
      color: '#FFFFFF', 
      border: '#1A3353'
    },
    outline: {
      bg: 'transparent',
      hover: '#f0f4ff',
      color: '#0F2A55',
      border: '#0F2A55'
    },
    ghost: {
      bg: 'transparent',
      hover: '#f5f5f5',
      color: '#1A3353',
      border: 'transparent'
    },
    danger: {
      bg: '#d32f2f',
      hover: '#c62828',
      color: '#FFFFFF',
      border: '#d32f2f'
    },
    success: {
      bg: '#4caf50',
      hover: '#43a047',
      color: '#FFFFFF',
      border: '#4caf50'
    }
  };
  return colors[variant];
};

// Helper function to get button sizes
const getButtonSize = (size: ButtonSize) => {
  const sizes = {
    small: {
      height: '32px',
      padding: '6px 16px',
      fontSize: '0.875rem'
    },
    medium: {
      height: '40px',
      padding: '8px 20px',
      fontSize: '0.875rem'
    },
    large: {
      height: '48px',
      padding: '12px 24px',
      fontSize: '1rem'
    }
  };
  return sizes[size];
};

// Helper function to get button shape
const getButtonShape = (shape: ButtonShape) => {
  const shapes = {
    rounded: '4px',
    pill: '999px',
    square: '0px'
  };
  return shapes[shape];
};

// Styled Button Component
export const StyledButton = styled(Button)<{
  $variant: ButtonVariant;
  $size: ButtonSize;
  $shape: ButtonShape;
}>`
  ${({ $variant, $size, $shape }) => {
    const colors = getButtonColors($variant);
    const sizeStyles = getButtonSize($size);
    const borderRadius = getButtonShape($shape);
    
    return `
      height: ${sizeStyles.height};
      padding: ${sizeStyles.padding};
      font-size: ${sizeStyles.fontSize};
      border-radius: ${borderRadius};
      text-transform: none;
      font-weight: 600;
      transition: all 0.2s ease-in-out;
      box-shadow: ${$variant === 'outline' || $variant === 'ghost' ? 'none' : '0px 1px 5px 0px #0000001F, 0px 2px 2px 0px #00000024, 0px 3px 1px -2px #00000033'};
      
      background-color: ${colors.bg};
      color: ${colors.color};
      border: 1px solid ${colors.border};
      
      &:hover {
        background-color: ${colors.hover};
        border-color: ${$variant === 'outline' ? colors.border : colors.hover};
        box-shadow: ${$variant === 'outline' || $variant === 'ghost' ? 'none' : '0px 2px 8px 0px #0000002F, 0px 4px 4px 0px #00000024, 0px 6px 2px -2px #00000033'};
      }
      
      &:disabled {
        background-color: #f5f5f5;
        color: #9e9e9e;
        border-color: #e0e0e0;
        box-shadow: none;
        cursor: not-allowed;
      }
      
      &:focus {
        outline: 2px solid ${colors.bg}40;
        outline-offset: 2px;
      }
    `;
  }}
`;

// Styled Icon Button Component
export const StyledIconButton = styled(IconButton)<{
  $variant: 'default' | 'primary' | 'secondary' | 'danger';
  $size: ButtonSize;
}>`
  ${({ $variant, $size }) => {
    const sizeMap = {
      small: '32px',
      medium: '40px', 
      large: '48px'
    };
    
    const colors = {
      default: { bg: 'transparent', hover: '#f5f5f5', color: '#1A3353' },
      primary: { bg: '#1976D2', hover: '#1565C0', color: '#FFFFFF' },
      secondary: { bg: '#1A3353', hover: '#0F2A55', color: '#FFFFFF' },
      danger: { bg: '#d32f2f', hover: '#c62828', color: '#FFFFFF' }
    };
    
    const buttonColors = colors[$variant];
    
    return `
      width: ${sizeMap[$size]};
      height: ${sizeMap[$size]};
      background-color: ${buttonColors.bg};
      color: ${buttonColors.color};
      border-radius: 8px;
      transition: all 0.2s ease-in-out;
      
      &:hover {
        background-color: ${buttonColors.hover};
      }
      
      &:disabled {
        background-color: #f5f5f5;
        color: #9e9e9e;
        cursor: not-allowed;
      }
    `;
  }}
`;

// Styled Fab Component
export const StyledFab = styled(Fab)<{
  $size: ButtonSize;
  $direction: 'left' | 'right' | 'default';
}>`
  ${({ $size, $direction }) => {
    const sizeMap = {
      small: { height: '32px', width: '16px' },
      medium: { height: '40px', width: '20px' },
      large: { height: '48px', width: '24px' }
    };
    
    const fabSize = sizeMap[$size];
    
    let borderRadius = '8px';
    let margin = '0';
    
    if ($direction === 'left') {
      borderRadius = '7px 0px 0px 7px';
      margin = '0 7px 0 0';
    } else if ($direction === 'right') {
      borderRadius = '0px 7px 7px 0px';
      margin = '0 0 0 7px';
    }
    
    return `
      height: ${fabSize.height};
      min-height: ${fabSize.height};
      width: ${fabSize.width};
      min-width: ${fabSize.width};
      border-radius: ${borderRadius};
      margin: ${margin};
      background-color: whitesmoke;
      box-shadow: 0px 1px 1px -1px rgba(0,0,0,0.2), 0px 0px 3px 0px rgba(0,0,0,0.14), 0px 1px 0px 0px rgba(0,0,0,0.12);
      
      &:hover {
        background-color: #e0e0e0;
      }
    `;
  }}
`;

// Loading Spinner Component
export const LoadingSpinner = styled(CircularProgress)`
  color: inherit;
  margin-right: 8px;
`;
