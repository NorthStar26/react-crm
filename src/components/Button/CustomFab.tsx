import React from 'react';
import { CustomFabProps } from './types';
import { StyledFab } from './styles';

/**
 * CustomFab - A reusable floating action button component
 * 
 * @param size - Button size (small, medium, large)
 * @param direction - Direction for navigation fabs (left, right, default)
 * @param children - Icon content
 * @param disabled - Disable the button
 * @param onClick - Click handler
 * @param ...rest - Other Material-UI Fab props
 */
export const CustomFab: React.FC<CustomFabProps> = ({
  size = 'medium',
  direction = 'default',
  children,
  disabled,
  onClick,
  ...rest
}) => {
  return (
    <StyledFab
      $size={size}
      $direction={direction}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {children}
    </StyledFab>
  );
};
