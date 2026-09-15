import { Link, useNavigate } from 'react-router-dom';

import { useAppServices } from '../../app/providers';
import { useAuth } from '../../features/auth/auth-provider';
import {
  getPublicPagePath,
} from '../../features/photos/public-page-path';

import {
  primaryButtonClassName,
  secondaryButtonClassName,
} from '../ui/button';
import { HeaderNavLink } from './header-nav-link';
import { MarketingNavLinks } from './marketing-nav-links';

function GuestTopMenu() {
  return (
    <nav
      aria-label="Primary"
      className="flex items-center gap-5 sm:gap-6"
    >
      <MarketingNavLinks />
      <HeaderNavLink to="/sign-in">Sign in</HeaderNavLink>
      <Link
        to="/create"
        className={`hidden rounded-xl sm:inline-flex ${primaryButtonClassName}`}
      >
        Create your page
      </Link>
    </nav>
  );
}

function AppTopMenu() {
  const { authService } = useAppServices();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  return (
    <nav
      aria-label="Primary"
      className="flex items-center gap-4 sm:gap-6"
    >
      <HeaderNavLink to="/photos">My Photos</HeaderNavLink>
      <HeaderNavLink to={getPublicPagePath(user.id)}>
        View public page
      </HeaderNavLink>
      <HeaderNavLink to="/settings">Settings</HeaderNavLink>
      <button
        type="button"
        className={secondaryButtonClassName}
        onClick={() => {
          void authService.logout().then(() => {
            void navigate('/');
          });
        }}
      >
        Sign out
      </button>
    </nav>
  );
}

export function TopMenu() {
  const { user, isReady } = useAuth();

  if (!isReady) {
    return (
      <div
        aria-hidden="true"
        className="h-5 w-40 animate-pulse rounded bg-slate-100"
      />
    );
  }

  if (user) {
    return <AppTopMenu />;
  }

  return <GuestTopMenu />;
}
