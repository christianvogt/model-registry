import React from 'react';
import CFormSection from '~/shared/components/pf-overrides/FormSection';
import { FormSectionProps } from '../componentTypes';

export const FormSection: React.FC<FormSectionProps> = ({ children, ...props }) => (
  <CFormSection {...props}>{children}</CFormSection>
);
