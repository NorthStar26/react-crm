import React from 'react';
import { CustomButtonProps } from './types';
import { StyledButton, LoadingSpinner } from './styles';

/**
 * CustomButton - A reusable button component built on top of Material-UI
 * 
 * @param variant - Button style variant (primary, secondary, outline, ghost, danger, success)
 * @param size - Button size (small, medium, large)
 * @param shape - Button shape (rounded, pill, square)
 * @param loading - Show loading spinner
 * @param startIcon - Icon to display at the start
 * @param endIcon - Icon to display at the end
 * @param children - Button content
 * @param disabled - Disable the button
 * @param onClick - Click handler
 * @param ...rest - Other Material-UI Button props
 */
export const CustomButton: React.FC<CustomButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  shape = 'rounded',
  loading = false,
  startIcon,
  endIcon,
  children,
  disabled,
  onClick,
  ...rest
}) => {
  return (
    <StyledButton
      $variant={variant}
      $size={size}
      $shape={shape}
      disabled={disabled || loading}
      onClick={onClick}
      startIcon={loading ? <LoadingSpinner size={16} /> : startIcon}
      endIcon={!loading ? endIcon : undefined}
      {...rest}
    >
      {children}
    </StyledButton>
  );
};
