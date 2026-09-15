import type { ReactNode } from 'react';

import { Button } from '../ui/button';
import { GoogleIcon } from './google-icon';

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
  onGoogleContinue: () => void;
  isGoogleBusy?: boolean;
}

export function AuthDivider() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-slate-200" />
      <span className="text-sm text-slate-400">or</span>
      <div className="h-px flex-1 bg-slate-200" />
    </div>
  );
}

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
  onGoogleContinue,
  isGoogleBusy = false,
}: AuthCardProps) {
  return (
    <section className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          {subtitle}
        </p>
      </div>

      <div className="mt-8 grid gap-5">
        <Button
          variant="secondary"
          className="w-full rounded-xl"
          disabled={isGoogleBusy}
          onClick={onGoogleContinue}
        >
          <GoogleIcon />
          Continue with Google
        </Button>

        <AuthDivider />

        {children}
      </div>

      <div className="mt-6 text-center text-sm text-slate-500">
        {footer}
      </div>
    </section>
  );
}
