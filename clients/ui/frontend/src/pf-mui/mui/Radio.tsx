import React from 'react';
import FormControlLabel from '@mui/material/FormControlLabel';
import MuiRadio from '@mui/material/Radio';
import { RadioProps } from '../componentTypes';

export const Radio: React.FC<RadioProps> = ({ isChecked, label, ...props }) => (
  <FormControlLabel control={<MuiRadio checked={isChecked} {...props} />} label={label} />
);
