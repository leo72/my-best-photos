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
import { MobileNavLink } from './mobile-nav-link';
import { MobileNavMenu } from './mobile-nav-menu';

function GuestTopMenu() {
  return (
    <>
      <nav
        aria-label="Primary"
        className="hidden items-center gap-5 md:flex md:gap-6"
      >
        <MarketingNavLinks />
        <HeaderNavLink to="/sign-in">Sign in</HeaderNavLink>
        <Link
          to="/create"
          className={`rounded-xl ${primaryButtonClassName}`}
        >
          Create your page
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

function UnverifiedTopMenu() {
  const { authService } = useAppServices();
  const navigate = useNavigate();

  async function signOut(): Promise<void> {
    await authService.logout();
    void navigate('/');
  }

  return (
    <nav aria-label="Primary" className="flex items-center">
      <button
        type="button"
        className={secondaryButtonClassName}
        onClick={() => {
          void signOut();
        }}
      >
        Sign out
      </button>
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

  const publicPagePath = getPublicPagePath(user.id);

  async function signOut(): Promise<void> {
    await authService.logout();
    void navigate('/');
  }

  return (
    <>
      <nav
        aria-label="Primary"
        className="hidden items-center gap-4 md:flex md:gap-6"
      >
        <HeaderNavLink to="/photos">My Photos</HeaderNavLink>
        <HeaderNavLink to={publicPagePath}>
          View public page
        </HeaderNavLink>
        <HeaderNavLink to="/settings">Settings</HeaderNavLink>
        <button
          type="button"
          className={secondaryButtonClassName}
          onClick={() => {
            void signOut();
          }}
        >
          Sign out
        </button>
      </nav>

      <MobileNavMenu>
        {(close) => (
          <>
            <MobileNavLink to="/photos" onNavigate={close}>
              My Photos
            </MobileNavLink>
            <MobileNavLink
              to={publicPagePath}
              onNavigate={close}
            >
              View public page
            </MobileNavLink>
            <MobileNavLink to="/settings" onNavigate={close}>
              Settings
            </MobileNavLink>
            <button
              type="button"
              className={`mt-2 w-full ${secondaryButtonClassName}`}
              onClick={() => {
                close();
                void signOut();
              }}
            >
              Sign out
            </button>
          </>
        )}
      </MobileNavMenu>
    </>
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

  if (user?.emailVerified) {
    return <AppTopMenu />;
  }

  if (user) {
    return <UnverifiedTopMenu />;
  }

  return <GuestTopMenu />;
}
