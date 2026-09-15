import { Link } from 'react-router-dom';

import { Container } from '../components/layout/container';
import { SiteLayout } from '../components/layout/site-layout';
import { primaryButtonClassName } from '../components/ui/button';

export function PricingPage() {
  return (
    <SiteLayout>
      <Container as="main" className="py-14 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Pricing
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-500 sm:text-lg">
            Your 10 photos are free — and they always will be.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
          <p className="text-sm font-semibold tracking-[0.16em] text-slate-400 uppercase">
            Free forever
          </p>
          <p className="mt-3 text-5xl font-bold tracking-tight text-slate-950">
            $0
          </p>
          <p className="mt-4 text-base leading-7 text-slate-500">
            Keep up to 10 photos with My10Photos at no cost.
            No trial clock, no surprise fees — your set stays
            free for as long as the product exists.
          </p>
          <Link
            to="/create"
            className={`${primaryButtonClassName} mt-8 inline-flex`}
          >
            Start your 10 photos
          </Link>
        </div>
      </Container>
    </SiteLayout>
  );
}
