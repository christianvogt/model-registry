import React from 'react';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { SearchInputProps } from '../componentTypes';

export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder,
  value,
  onChange,
  onClear,
  style,
  'data-testid': dataTestId,
}) => (
  <TextField
    variant="outlined"
    placeholder={placeholder}
    value={value}
    onChange={
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      onChange ? (e) => onChange(e as React.FormEvent<HTMLInputElement>, e.target.value) : undefined
    }
    style={style}
    data-testid={dataTestId}
    slotProps={{
      input: {
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
        endAdornment: value ? (
          <InputAdornment position="end">
            <IconButton aria-label="clear" onClick={onClear} edge="end">
              <ClearIcon />
            </IconButton>
          </InputAdornment>
        ) : null,
      },
    }}
  />
);
