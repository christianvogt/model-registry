import React from 'react';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { FormTextInputProps } from '../componentTypes';

export const FormTextInput: React.FC<FormTextInputProps> = ({
  isRequired,
  id,
  label,
  name,
  value,
  onChange,
  placeholder,
  isDisabled,
  startAdornment,
  endAdornment,
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
    slotProps={{
      input: {
        startAdornment: startAdornment ? (
          <InputAdornment position="start">{startAdornment}</InputAdornment>
        ) : undefined,
        endAdornment: endAdornment ? (
          <InputAdornment position="end">{endAdornment}</InputAdornment>
        ) : undefined,
      },
    }}
    helperText={helperText}
  />
);
