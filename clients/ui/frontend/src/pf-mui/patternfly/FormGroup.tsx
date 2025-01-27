import React from 'react';
import { FormGroup as PFFormGroup } from '@patternfly/react-core';
import { FormGroupProps } from '../componentTypes';

export const FormGroup: React.FC<FormGroupProps> = ({ children, ...props }) => (
  <PFFormGroup {...props}>{children}</PFFormGroup>
);
