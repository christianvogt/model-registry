import React from 'react';
import { Spinner as PFCSpinner } from '@patternfly/react-core';
import { SpinnerProps } from '../componentTypes';

export const Spinner: React.FC<SpinnerProps> = ({ size }) => <PFCSpinner size={size} />;
