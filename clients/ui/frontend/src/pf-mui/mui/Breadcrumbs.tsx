import React from 'react';
import MUIBreadcrumbs from '@mui/material/Breadcrumbs';
import { BreadcrumbItemProps, BreadcrumbsProps } from '../componentTypes';

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ ...props }) => (
  <MUIBreadcrumbs {...props} />
);

export const BreadcrumbItem: React.FC<BreadcrumbItemProps> = ({ children }) => <>{children}</>;
