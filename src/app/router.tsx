import { createHashRouter } from 'react-router-dom';

import { HomePage } from '../pages/home-page';

export const router = createHashRouter([
  {
    path: '/',
    element: <HomePage />,
  },
]);
