import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import {
  primaryButtonClassName,
  secondaryButtonClassName,
} from '../../components/button';
import { MarketingNavLinks } from '../../components/marketing-nav-links';
import { TextLink } from '../../components/text-link';

function AuthHeaderNav({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <nav
      aria-label="Primary"
      className={`flex items-center gap-4 sm:gap-6 ${className}`}
    >
      <MarketingNavLinks />
      {children}
    </nav>
  );
}

export function SignInHeaderActions() {
  return (
    <AuthHeaderNav>
      <Link
        to="/create"
        className={`hidden sm:inline-flex ${secondaryButtonClassName}`}
      >
        Create your page
      </Link>
      <Link to="/sign-in" className={primaryButtonClassName}>
        Sign in
      </Link>
    </AuthHeaderNav>
  );
}

export function CreateHeaderActions() {
  return (
    <AuthHeaderNav className="flex-wrap justify-end">
      <p className="m-0 text-sm text-slate-500">
        Already have an account?{' '}
        <TextLink to="/sign-in">Sign in</TextLink>
      </p>
    </AuthHeaderNav>
  );
}
