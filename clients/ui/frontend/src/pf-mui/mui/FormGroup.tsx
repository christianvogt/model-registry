import React from 'react';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import MUIFormGroup from '@mui/material/FormGroup';
import { FormGroupProps } from '../componentTypes';

export const FormGroup: React.FC<FormGroupProps> = ({ children, label, fieldId, isRequired }) => (
  <MUIFormGroup>
    <FormControl>
      <FormLabel htmlFor={fieldId} required={isRequired}>
        {label}
      </FormLabel>
      {children}
    </FormControl>
  </MUIFormGroup>
);
