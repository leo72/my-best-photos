import { NavLink } from 'react-router-dom';

import type { ReactNode } from 'react';

interface HeaderNavLinkProps {
  to: string;
  children: ReactNode;
  end?: boolean;
}

export function HeaderNavLink({
  to,
  children,
  end = false,
}: HeaderNavLinkProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          'inline-flex items-center rounded-full px-3 py-1.5 text-sm no-underline transition-colors',
          isActive
            ? 'bg-slate-100 font-medium text-slate-950'
            : 'text-slate-500 hover:text-slate-950',
        ].join(' ')
      }
    >
      {children}
    </NavLink>
  );
}
