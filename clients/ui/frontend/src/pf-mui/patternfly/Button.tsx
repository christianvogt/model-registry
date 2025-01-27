import * as React from 'react';
import { Button as PFCButton } from '@patternfly/react-core';
import { ButtonProps } from '../componentTypes';

export const Button: React.FC<ButtonProps> = ({ children, ...props }) => (
  <PFCButton {...props}>{children}</PFCButton>
);
