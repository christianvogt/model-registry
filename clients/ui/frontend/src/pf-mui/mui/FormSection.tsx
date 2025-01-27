import React from 'react';
import FormLabel from '@mui/material/FormLabel';
import { FormSectionProps } from '../componentTypes';

// TODO section needs aria-label and aria-describedby
export const FormSection: React.FC<FormSectionProps> = ({ children, title, description }) => (
  <section role="group" style={{ display: 'grid', rowGap: '24px' }}>
    <FormLabel>{title}</FormLabel>
    {description ? <p>{description}</p> : null}
    {children}
  </section>
);
