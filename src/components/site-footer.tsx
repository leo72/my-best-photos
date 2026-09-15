import { Container } from './container';
import { Logo } from './logo';

const productLinks = [
  { label: 'Features', href: '#' },
  { label: 'Pricing', href: '#' },
  { label: 'Explore', href: '#' },
] as const;

const supportLinks = [
  { label: 'Help Center', href: '#' },
  { label: 'Contact', href: '#' },
  { label: 'Privacy', href: '#' },
  { label: 'Terms', href: '#' },
] as const;

function GitHubIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5 fill-current"
    >
      <path d="M12 2C6.477 2 2 6.584 2 12.223c0 4.514 2.865 8.342 6.839 9.694.5.094.683-.222.683-.48 0-.237-.01-.866-.014-1.7-2.782.618-3.369-1.372-3.369-1.372-.454-1.18-1.11-1.494-1.11-1.494-.908-.636.069-.623.069-.623 1.003.072 1.53 1.056 1.53 1.056.892 1.567 2.341 1.114 2.91.852.092-.663.35-1.114.636-1.37-2.22-.259-4.555-1.139-4.555-5.07 0-1.12.39-2.036 1.029-2.754-.103-.258-.446-1.298.098-2.705 0 0 .84-.276 2.75 1.052A9.34 9.34 0 0 1 12 6.908c.85.004 1.705.117 2.504.344 1.909-1.328 2.747-1.052 2.747-1.052.546 1.407.203 2.447.1 2.705.64.718 1.028 1.634 1.028 2.754 0 3.941-2.339 4.808-4.566 5.062.359.317.679.943.679 1.901 0 1.372-.012 2.477-.012 2.814 0 .26.18.578.688.48A10.24 10.24 0 0 0 22 12.223C22 6.584 17.523 2 12 2Z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5 fill-current"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.254 5.686L18.244 2.25Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5 fill-current"
    >
      <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5Zm8.75 1.75a1.125 1.125 0 1 1 0 2.25 1.125 1.125 0 0 1 0-2.25ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
    </svg>
  );
}

function FooterLinkList({
  title,
  links,
}: {
  title: string;
  links: ReadonlyArray<{ label: string; href: string }>;
}) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-950">
        {title}
      </h2>
      <ul className="mt-4 list-none space-y-3 p-0">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="text-sm text-slate-500 no-underline transition-colors hover:text-slate-950"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <Container className="py-12 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-[minmax(0,1.4fr)_repeat(2,minmax(0,1fr))] lg:grid-cols-[minmax(0,1.6fr)_repeat(2,minmax(0,0.7fr))_minmax(0,1fr)]">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm leading-6 text-slate-500">
              A simpler way to share what matters.
            </p>
            <div className="mt-5 flex items-center gap-4 text-slate-500">
              <a
                href="https://github.com"
                aria-label="GitHub"
                className="transition-colors hover:text-slate-950"
              >
                <GitHubIcon />
              </a>
              <a
                href="https://x.com"
                aria-label="X"
                className="transition-colors hover:text-slate-950"
              >
                <XIcon />
              </a>
              <a
                href="https://instagram.com"
                aria-label="Instagram"
                className="transition-colors hover:text-slate-950"
              >
                <InstagramIcon />
              </a>
            </div>
          </div>

          <FooterLinkList title="Product" links={productLinks} />
          <FooterLinkList title="Support" links={supportLinks} />

          <div className="sm:col-span-3 lg:col-span-1 lg:text-right">
            <p className="text-sm text-slate-500">
              © 2026 My Best Photos
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Made with ❤️ for photographers
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
