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
          'inline-flex h-16 items-center border-b-2 text-sm no-underline transition-colors',
          isActive
            ? 'border-slate-950 font-medium text-slate-950'
            : 'border-transparent text-slate-500 hover:text-slate-950',
        ].join(' ')
      }
    >
      {children}
    </NavLink>
  );
}
