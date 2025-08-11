import React from 'react';
import EditIcon from '@mui/icons-material/Edit';
import { CustomButton } from './CustomButton';
import { CustomButtonProps } from './types';

interface EditButtonProps
  extends Omit<CustomButtonProps, 'variant' | 'startIcon'> {
  text?: string;
  iconSize?: number;
  variant?: 'primary' | 'secondary' | 'outline';
}

/**
 * EditButton - Reusable edit button
 * Based on CustomButton with preset styles
 *
 * @param text - Button text (default "Edit ")
 * @param iconSize - Button text (default "Edit ")
 * @param variant -Button option (default "primary")
 */

export const EditButton: React.FC<EditButtonProps> = ({
  text = 'Edit',
  iconSize = 16,
  variant = 'primary',
  sx = { width: '164px' },
  ...rest
}) => {
  return (
    <CustomButton
      variant={variant}
      startIcon={<EditIcon sx={{ width: iconSize, height: iconSize }} />}
      sx={{
        height: '46px',
        backgroundColor: variant === 'primary' ? '#1976D2' : undefined,
        boxShadow:
          '0px 1px 5px rgba(0, 0, 0, 0.12), 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px rgba(0, 0, 0, 0.14)',
        '&:hover': {
          backgroundColor: variant === 'primary' ? '#1565C0' : undefined,
          boxShadow:
            '0px 2px 8px rgba(0, 0, 0, 0.15), 0px 4px 2px -2px rgba(0, 0, 0, 0.2), 0px 3px 3px rgba(0, 0, 0, 0.14)',
        },
        fontFamily: 'Roboto',
        fontWeight: 500,
        fontSize: '16px',
        lineHeight: '24px',
        letterSpacing: '0.15px',
        ...sx,
      }}
      {...rest}
    >
      {text}
    </CustomButton>
  );
};
