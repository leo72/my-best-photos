import { createHashRouter } from 'react-router-dom';

import { HomePage } from '../pages/home-page';
import { PlaceholderPage } from '../pages/placeholder-page';

export const router = createHashRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/explore',
    element: (
      <PlaceholderPage
        title="Explore"
        description="Public pages will show up here soon."
      />
    ),
  },
  {
    path: '/pricing',
    element: (
      <PlaceholderPage
        title="Pricing"
        description="Pricing details will show up here soon."
      />
    ),
  },
  {
    path: '/sign-in',
    element: (
      <PlaceholderPage
        title="Sign in"
        description="Use the home page auth form for now while the dedicated sign-in page is built."
      />
    ),
  },
]);
