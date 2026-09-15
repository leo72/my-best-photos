import { NavLink } from 'react-router-dom';

import type { ReactNode } from 'react';

interface MobileNavLinkProps {
  to: string;
  children: ReactNode;
  end?: boolean;
  onNavigate?: () => void;
}

export function MobileNavLink({
  to,
  children,
  end = false,
  onNavigate,
}: MobileNavLinkProps) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        [
          'block rounded-xl px-3 py-3 text-base no-underline transition-colors',
          isActive
            ? 'bg-slate-100 font-medium text-slate-950'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950',
        ].join(' ')
      }
    >
      {children}
    </NavLink>
  );
}
