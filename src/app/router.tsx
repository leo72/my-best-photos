import { createHashRouter } from 'react-router-dom';

import { CreatePage } from '../pages/create-page';
import { ExamplesPage } from '../pages/examples-page';
import { HomePage } from '../pages/home-page';
import { PlaceholderPage } from '../pages/placeholder-page';
import { PricingPage } from '../pages/pricing-page';
import { SignInPage } from '../pages/sign-in-page';

export const router = createHashRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/examples',
    element: <ExamplesPage />,
  },
  {
    path: '/pricing',
    element: <PricingPage />,
  },
  {
    path: '/sign-in',
    element: <SignInPage />,
  },
  {
    path: '/create',
    element: <CreatePage />,
  },
  {
    path: '/terms',
    element: (
      <PlaceholderPage
        title="Terms of Service"
        description="Terms of Service will show up here soon."
      />
    ),
  },
  {
    path: '/privacy',
    element: (
      <PlaceholderPage
        title="Privacy Policy"
        description="Privacy Policy will show up here soon."
      />
    ),
  },
]);
