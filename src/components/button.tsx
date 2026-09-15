import type {
  ButtonHTMLAttributes,
  ReactNode,
} from 'react';

type ButtonVariant = 'primary' | 'secondary';

export const primaryButtonClassName =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white no-underline transition-colors hover:bg-slate-800 disabled:cursor-default disabled:bg-slate-400';

export const secondaryButtonClassName =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-950 no-underline transition-colors hover:bg-slate-50 disabled:cursor-default disabled:text-slate-400';

const variantClasses: Record<ButtonVariant, string> = {
  primary: primaryButtonClassName,
  secondary: secondaryButtonClassName,
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
