import { createHashRouter } from 'react-router-dom';

import { CreatePage } from '../pages/create-page';
import { ExamplesPage } from '../pages/examples-page';
import { HomePage } from '../pages/home-page';
import { MyPhotosPage } from '../pages/my-photos-page';
import { PlaceholderPage } from '../pages/placeholder-page';
import { PricingPage } from '../pages/pricing-page';
import { PublicPage } from '../pages/public-page';
import { SettingsPage } from '../pages/settings-page';
import { SignInPage } from '../pages/sign-in-page';

export const router = createHashRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/photos',
    element: <MyPhotosPage />,
  },
  {
    path: '/u/:ownerId',
    element: <PublicPage />,
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
    path: '/settings',
    element: <SettingsPage />,
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
