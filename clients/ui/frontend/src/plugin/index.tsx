import * as React from 'react';

export { NamespaceSelectorContextProvider } from '~/shared/context/NamespaceSelectorContext';
export { ModelRegistrySelectorContextProvider } from '~/app/context/ModelRegistrySelectorContext';

export const navItems = [
  {
    label: 'Model Registry',
    href: '/model-registry',
  },
];

export const adminNavItems = [
  {
    label: 'Model Registry',
    href: '/model-registry-settings',
  },
];

const ModelRegistryRoutes = React.lazy(
  () => import('../app/pages/modelRegistry/ModelRegistryRoutes'),
);
const ModelRegistrySettingsRoutes = React.lazy(
  () => import('../app/pages/settings/ModelRegistrySettingsRoutes'),
);

export const routes = [{ path: '/model-registry/*', element: <ModelRegistryRoutes /> }];
export const adminRoutes = [
  { path: '/model-registry-settings/*', element: <ModelRegistrySettingsRoutes /> },
];
