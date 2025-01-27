import React from 'react';
import { SearchInput as PFSearchInput } from '@patternfly/react-core';
import { SearchInputProps } from '../componentTypes';

export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder,
  value,
  onChange,
  onClear,
  style,
  'data-testid': dataTestId,
}) => (
  <PFSearchInput
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    onClear={onClear}
    style={style}
    data-testid={dataTestId}
  />
);
