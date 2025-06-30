import { ButtonProps as MuiButtonProps, IconButtonProps, FabProps } from '@mui/material';
import { ReactNode } from 'react';

// Base button variants that we support
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';

// Button sizes
export type ButtonSize = 'small' | 'medium' | 'large';

// Button shapes
export type ButtonShape = 'rounded' | 'pill' | 'square';

// Custom button interface extending MUI ButtonProps
export interface CustomButtonProps extends Omit<MuiButtonProps, 'variant' | 'size'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}

// Icon button interface
export interface CustomIconButtonProps extends Omit<IconButtonProps, 'size'> {
  size?: ButtonSize;
  variant?: 'default' | 'primary' | 'secondary' | 'danger';
  children: ReactNode;
}

// Fab button interface
export interface CustomFabProps extends Omit<FabProps, 'size'> {
  size?: ButtonSize;
  direction?: 'left' | 'right' | 'default';
  children: ReactNode;
}
