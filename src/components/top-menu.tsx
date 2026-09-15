import {
  ArrowTopRightOnSquareIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { useAppServices } from '../app/providers';
import { useAuth } from '../features/auth/auth-provider';

import type { AuthUser } from '../features/auth/auth-session';

import { primaryButtonClassName } from './button';
import { HeaderNavLink } from './header-nav-link';
import { MarketingNavLinks } from './marketing-nav-links';

function getDisplayName(user: AuthUser): string {
  if (!user.email) {
    return 'Account';
  }

  const localPart = user.email.split('@')[0];

  if (!localPart) {
    return 'Account';
  }

  return localPart.charAt(0).toUpperCase() + localPart.slice(1);
}

function getInitials(displayName: string): string {
  return displayName.slice(0, 1).toUpperCase();
}

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

function UserMenu({ user }: { user: AuthUser }) {
  const { authService } = useAppServices();
  const [isOpen, setIsOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const displayName = getDisplayName(user);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent): void {
      if (
        rootRef.current
        && !rootRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="inline-flex h-16 cursor-pointer items-center gap-2 border-0 bg-transparent p-0 text-sm text-slate-950"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span
          aria-hidden="true"
          className="inline-flex size-8 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-xs font-semibold text-slate-700"
        >
          {getInitials(displayName)}
        </span>
        <span className="hidden sm:inline">{displayName}</span>
        <ChevronDownIcon className="size-4" />
      </button>

      {isOpen ? (
        <div
          id={menuId}
          role="menu"
          className="absolute top-full right-0 z-10 mt-1 min-w-40 rounded-xl border border-slate-200 bg-white py-1 shadow-sm"
        >
          <button
            type="button"
            role="menuitem"
            className="block w-full cursor-pointer border-0 bg-transparent px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-950"
            onClick={() => {
              setIsOpen(false);
              void authService.logout();
            }}
          >
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}

function AppTopMenu({ user }: { user: AuthUser }) {
  return (
    <nav
      aria-label="Primary"
      className="flex items-center gap-5 sm:gap-6"
    >
      <HeaderNavLink to="/" end>
        My Photos
      </HeaderNavLink>

      <a
        href="#/"
        target="_blank"
        rel="noreferrer"
        className="inline-flex h-16 items-center gap-1.5 text-sm text-slate-500 no-underline transition-colors hover:text-slate-950"
      >
        View my page
        <ArrowTopRightOnSquareIcon className="size-3.5" />
      </a>

      <UserMenu user={user} />
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
    return <AppTopMenu user={user} />;
  }

  return <GuestTopMenu />;
}
