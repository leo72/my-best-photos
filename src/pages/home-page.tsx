import { HomeFeatures } from '../components/home/features';
import { HomeHero } from '../components/home/hero';
import { Container } from '../components/layout/container';
import { SiteLayout } from '../components/layout/site-layout';

export function HomePage() {
  return (
    <SiteLayout>
      <Container
        as="main"
        size="wide"
        className="py-8 sm:py-10 lg:py-12"
      >
        <div className="grid gap-10 sm:gap-12">
          <HomeHero />
          <HomeFeatures />
        </div>
      </Container>
    </SiteLayout>
  );
}
