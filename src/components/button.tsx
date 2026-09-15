import type {
  ButtonHTMLAttributes,
  ReactNode,
} from 'react';

export const primaryButtonClassName =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-medium text-white no-underline transition-colors hover:bg-slate-800 disabled:cursor-default disabled:bg-slate-400';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function Button({
  className = '',
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${primaryButtonClassName} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
