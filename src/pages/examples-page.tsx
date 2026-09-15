import { ExampleCard } from '../components/examples/example-card';
import { EXAMPLE_SETS } from '../components/examples/example-data';
import { ExamplesSharingModes } from '../components/examples/sharing-modes';
import { Container } from '../components/layout/container';
import { SiteLayout } from '../components/layout/site-layout';

export function ExamplesPage() {
  return (
    <SiteLayout>
      <Container
        as="main"
        size="wide"
        className="py-10 sm:py-12 lg:py-14"
      >
        <header className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Examples
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-500 sm:text-lg">
            See how people use My10Photos to keep their most
            useful photos ready — for profiles, family,
            favorites, and sharing.
          </p>
        </header>

        <div className="mt-10 grid gap-5 sm:mt-12 sm:grid-cols-2 xl:grid-cols-4">
          {EXAMPLE_SETS.map((example) => (
            <ExampleCard key={example.id} example={example} />
          ))}
        </div>

        <div className="mt-10 sm:mt-14">
          <ExamplesSharingModes />
        </div>
      </Container>
    </SiteLayout>
  );
}
