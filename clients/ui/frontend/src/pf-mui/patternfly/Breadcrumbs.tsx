import React from 'react';
import {
  BreadcrumbItemProps,
  Breadcrumb as PFBreadcrumb,
  BreadcrumbItem as PFBreadcrumbItem,
} from '@patternfly/react-core';
import { BreadcrumbsProps } from '../componentTypes';

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ children }) => (
  <PFBreadcrumb>
    {React.Children.map(children, (child, index) => (
      <PFBreadcrumbItem isActive={index === React.Children.count(children) - 1}>
        {child}
      </PFBreadcrumbItem>
    ))}
  </PFBreadcrumb>
);

export const BreadcrumbItem: React.FC<BreadcrumbItemProps> = ({ children }) => <>{children}</>;
