import { Link, type LinkProps } from 'react-router-dom';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

export const textLinkClassName =
  'font-medium text-blue-600 no-underline transition-colors hover:text-blue-700';

interface TextLinkProps extends Omit<LinkProps, 'className'> {
  children: ReactNode;
  className?: string;
}

export function TextLink({
  children,
  className = '',
  ...props
}: TextLinkProps) {
  return (
    <Link
      className={`${textLinkClassName} ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
}

interface TextLinkButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function TextLinkButton({
  children,
  className = '',
  type = 'button',
  ...props
}: TextLinkButtonProps) {
  return (
    <button
      type={type}
      className={`cursor-pointer border-0 bg-transparent p-0 ${textLinkClassName} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
