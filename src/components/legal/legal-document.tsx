import type { ReactNode } from 'react';

import { Container } from '../layout/container';
import { SiteLayout } from '../layout/site-layout';

interface LegalDocumentProps {
  title: string;
  updated: string;
  children: ReactNode;
}

export function LegalDocument({
  title,
  updated,
  children,
}: LegalDocumentProps) {
  return (
    <SiteLayout>
      <Container as="main" className="py-14 sm:py-20">
        <article className="mx-auto max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            {title}
          </h1>
          <p className="mt-3 text-sm text-slate-400">
            Last updated {updated}
          </p>
          <div className="mt-10 space-y-8 text-base leading-7 text-slate-600">
            {children}
          </div>
        </article>
      </Container>
    </SiteLayout>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-950">
        {title}
      </h2>
      <div className="mt-2 space-y-3">{children}</div>
    </section>
  );
}
