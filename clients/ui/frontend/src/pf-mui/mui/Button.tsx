import React from 'react';
import MuiButton from '@mui/material/Button';
import { ButtonProps } from '../componentTypes';

export const Button: React.FC<ButtonProps> = ({
  children,
  variant,
  isDisabled,
  isLoading,
  ...props
}) => (
  <MuiButton
    variant={variant === 'link' ? 'text' : variant === 'primary' ? 'contained' : 'outlined'}
    disabled={isDisabled}
    loading={!!isLoading}
    loadingPosition="start"
    {...props}
  >
    {children}
  </MuiButton>
);
