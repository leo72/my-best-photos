import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
}

export function Logo({ className = '' }: LogoProps) {
  return (
    <Link
      to="/"
      className={`text-lg font-bold tracking-tight text-slate-950 no-underline ${className}`}
    >
      My Best Photos
    </Link>
  );
}
