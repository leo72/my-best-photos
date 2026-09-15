import { Container } from '../components/container';
import { SiteLayout } from '../components/site-layout';

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export function PlaceholderPage({
  title,
  description,
}: PlaceholderPageProps) {
  return (
    <SiteLayout>
      <Container as="main" className="py-16 sm:py-24">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">
          {title}
        </h1>
        <p className="mt-3 max-w-xl text-base leading-7 text-slate-500">
          {description}
        </p>
      </Container>
    </SiteLayout>
  );
}
