import { Container } from '../components/container';
import { SiteLayout } from '../components/site-layout';
import { AuthPanel } from '../features/auth/auth-panel';
import { GallerySection } from '../features/photos/gallery-section';

export function HomePage() {
  return (
    <SiteLayout>
      <Container as="main" className="py-8 sm:py-12">
        <AuthPanel />
        <GallerySection />
      </Container>
    </SiteLayout>
  );
}
