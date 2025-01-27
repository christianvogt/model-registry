import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { SpinnerProps } from '../componentTypes';

const sizeMap = {
  sm: 14,
  md: 16,
  lg: 24,
  xl: 56,
};

export const Spinner: React.FC<SpinnerProps> = ({ size }) => (
  <CircularProgress size={size ? sizeMap[size] : 16} />
);
