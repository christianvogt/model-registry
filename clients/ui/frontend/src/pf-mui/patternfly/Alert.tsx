import React from 'react';
import { AlertActionCloseButton, Alert as PFAert } from '@patternfly/react-core';
import { AlertProps } from '../componentTypes';

export const Alert: React.FC<AlertProps> = ({ onClose, children, ...props }) => (
  <PFAert
    actionClose={onClose ? <AlertActionCloseButton onClose={onClose} /> : undefined}
    {...props}
  >
    {children}
  </PFAert>
);
