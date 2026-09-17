import { Link } from 'react-router-dom';

import { MarketingNavLinks } from '../layout/marketing-nav-links';
import { MobileNavLink } from '../layout/mobile-nav-link';
import { MobileNavMenu } from '../layout/mobile-nav-menu';
import {
  primaryButtonClassName,
  secondaryButtonClassName,
} from '../ui/button';
import { TextLink } from '../ui/text-link';

export function CreateHeaderActions() {
  return (
    <>
      <nav
        aria-label="Primary"
        className="hidden items-center gap-4 md:flex md:gap-6"
      >
        <MarketingNavLinks />
        <p className="m-0 text-sm text-slate-500">
          Already have an account?{' '}
          <TextLink to="/sign-in">Sign in</TextLink>
        </p>
      </nav>

      <MobileNavMenu>
        {(close) => (
          <>
            <MobileNavLink to="/" end onNavigate={close}>
              Home
            </MobileNavLink>
            <MobileNavLink to="/examples" onNavigate={close}>
              Examples
            </MobileNavLink>
            <MobileNavLink to="/sign-in" onNavigate={close}>
              Sign in
            </MobileNavLink>
            <Link
              to="/create"
              className={`mt-2 ${primaryButtonClassName}`}
              onClick={close}
            >
              Create your page
            </Link>
          </>
        )}
      </MobileNavMenu>
    </>
  );
}

export function SignInHeaderActions() {
  return (
    <>
      <nav
        aria-label="Primary"
        className="hidden items-center gap-4 md:flex md:gap-6"
      >
        <MarketingNavLinks />
        <Link
          to="/create"
          className={secondaryButtonClassName}
        >
          Create your page
        </Link>
        <Link to="/sign-in" className={primaryButtonClassName}>
          Sign in
        </Link>
      </nav>

      <MobileNavMenu>
        {(close) => (
          <>
            <MobileNavLink to="/" end onNavigate={close}>
              Home
            </MobileNavLink>
            <MobileNavLink to="/examples" onNavigate={close}>
              Examples
            </MobileNavLink>
            <MobileNavLink to="/sign-in" onNavigate={close}>
              Sign in
            </MobileNavLink>
            <Link
              to="/create"
              className={`mt-2 ${primaryButtonClassName}`}
              onClick={close}
            >
              Create your page
            </Link>
          </>
        )}
      </MobileNavMenu>
    </>
  );
}
