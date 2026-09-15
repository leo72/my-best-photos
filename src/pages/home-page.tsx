import { Container } from '../components/container';
import { SiteLayout } from '../components/site-layout';
import { GallerySection } from '../features/photos/gallery-section';

export function HomePage() {
  return (
    <SiteLayout>
      <Container as="main" className="py-8 sm:py-12">
        <GallerySection />
      </Container>
    </SiteLayout>
  );
}
