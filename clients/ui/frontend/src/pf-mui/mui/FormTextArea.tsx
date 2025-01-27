import React from 'react';
import TextField from '@mui/material/TextField';
import { FormTextInputProps } from '../componentTypes';

export const FormTextArea: React.FC<FormTextInputProps> = ({
  isRequired,
  id,
  label,
  name,
  value,
  onChange,
  placeholder,
  isDisabled,
  helperText,
}) => (
  <TextField
    type="text"
    required={isRequired}
    name={name}
    id={id}
    label={label}
    variant="outlined"
    value={value}
    onChange={
      onChange
        ? // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          (e) => onChange(e as React.FormEvent<HTMLInputElement>, e.target.value)
        : undefined
    }
    placeholder={placeholder}
    disabled={isDisabled}
    multiline
    rows={2}
    helperText={helperText}
  />
);
