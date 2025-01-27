import React from 'react';
import { Radio as PFRadio } from '@patternfly/react-core';
import { RadioProps } from '../componentTypes';

export const Radio: React.FC<RadioProps> = (props) => <PFRadio {...props} />;
