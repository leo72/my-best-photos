import {
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import {
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';

const fieldClassName =
  'w-full rounded-xl border border-slate-200 bg-white py-3 pr-3.5 pl-10 text-sm text-slate-950 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none';

function AuthField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-950">
      {label}
      {children}
    </label>
  );
}

function IconInput({
  icon,
  trailing,
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  icon: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <span className="relative block">
      <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400">
        {icon}
      </span>
      <input
        {...props}
        className={`${fieldClassName} ${trailing ? 'pr-11' : ''} ${className}`}
      />
      {trailing}
    </span>
  );
}

type EmailFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type'
>;

export function EmailField(props: EmailFieldProps) {
  return (
    <AuthField label="Email">
      <IconInput
        type="email"
        autoComplete="email"
        required
        placeholder="you@example.com"
        icon={<EnvelopeIcon className="size-4" />}
        {...props}
      />
    </AuthField>
  );
}

type PasswordFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type'
>;

export function PasswordField(props: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <AuthField label="Password">
      <IconInput
        type={isVisible ? 'text' : 'password'}
        required
        icon={<LockClosedIcon className="size-4" />}
        trailing={
          <button
            type="button"
            className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer border-0 bg-transparent p-1 text-slate-400 hover:text-slate-700"
            aria-label={
              isVisible ? 'Hide password' : 'Show password'
            }
            onClick={() => setIsVisible((visible) => !visible)}
          >
            {isVisible ? (
              <EyeSlashIcon className="size-4" />
            ) : (
              <EyeIcon className="size-4" />
            )}
          </button>
        }
        {...props}
      />
    </AuthField>
  );
}
