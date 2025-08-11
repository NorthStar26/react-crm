import React from 'react';
import { CustomIconButtonProps } from './types';
import { StyledIconButton } from './styles';

/**
 * CustomIconButton - A reusable icon button component
 * 
 * @param variant - Button style variant (default, primary, secondary, danger)
 * @param size - Button size (small, medium, large)
 * @param children - Icon content
 * @param disabled - Disable the button
 * @param onClick - Click handler
 * @param ...rest - Other Material-UI IconButton props
 */
export const CustomIconButton: React.FC<CustomIconButtonProps> = ({
  variant = 'default',
  size = 'medium',
  children,
  disabled,
  onClick,
  ...rest
}) => {
  return (
    <StyledIconButton
      $variant={variant}
      $size={size}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {children}
    </StyledIconButton>
  );
};
