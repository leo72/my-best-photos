import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';

import { AuthStateProvider } from '../features/auth/auth-provider';
import { ExamplesPage } from '../pages/examples-page';
import { HomePage } from '../pages/home-page';
import { PricingPage } from '../pages/pricing-page';
import { PrivacyPage } from '../pages/privacy-page';
import { TermsPage } from '../pages/terms-page';

interface MarketingPage {
  path: string;
  outFile: string;
  title: string;
  description: string;
  heading: string;
  element: ReactElement;
}

const marketingPages: readonly MarketingPage[] = [
  {
    path: '/',
    outFile: 'index.html',
    title: 'My10Photos',
    description:
      'My10Photos — keep your 10 most important photos ready.',
    heading: 'Keep your 10 photos.',
    element: <HomePage />,
  },
  {
    path: '/examples',
    outFile: 'examples/index.html',
    title: 'Examples — My10Photos',
    description:
      'See how people use My10Photos to keep their most useful photos ready — for profiles, family, favorites, and sharing.',
    heading: 'Examples',
    element: <ExamplesPage />,
  },
  {
    path: '/pricing',
    outFile: 'pricing/index.html',
    title: 'Pricing — My10Photos',
    description:
      'Your 10 photos are free — and they always will be.',
    heading: 'Pricing',
    element: <PricingPage />,
  },
  {
    path: '/terms',
    outFile: 'terms/index.html',
    title: 'Terms of Service — My10Photos',
    description:
      'The rules for using My10Photos, a free place for up to 10 photos.',
    heading: 'Terms of Service',
    element: <TermsPage />,
  },
  {
    path: '/privacy',
    outFile: 'privacy/index.html',
    title: 'Privacy Policy — My10Photos',
    description:
      'How My10Photos handles your account, photos, and public page.',
    heading: 'Privacy Policy',
    element: <PrivacyPage />,
  },
];

export interface RenderedMarketingPage {
  outFile: string;
  title: string;
  description: string;
  heading: string;
  html: string;
}

export function renderMarketingPages(): RenderedMarketingPage[] {
  return marketingPages.map((page) => ({
    outFile: page.outFile,
    title: page.title,
    description: page.description,
    heading: page.heading,
    html: renderToStaticMarkup(
      <MemoryRouter initialEntries={[page.path]}>
        <AuthStateProvider value={{ user: null, isReady: true }}>
          {page.element}
        </AuthStateProvider>
      </MemoryRouter>,
    ),
  }));
}
