import React from 'react';
import MuiAlert from '@mui/material/Alert';
import MuiAlertTitle from '@mui/material/AlertTitle';
import { AlertProps } from '../componentTypes';

export const Alert: React.FC<AlertProps> = ({ title, children, variant, ...props }) => (
  <MuiAlert variant="outlined" severity={variant === 'danger' ? 'error' : variant} {...props}>
    <MuiAlertTitle>{title}</MuiAlertTitle>
    {children}
  </MuiAlert>
);
