import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
}

export function Logo({ className = '' }: LogoProps) {
  return (
    <Link
      to="/"
      className={`text-lg tracking-tight text-slate-950 no-underline ${className}`}
    >
      <span className="font-bold">My10</span>
      <span className="font-medium">Photos</span>
    </Link>
  );
}
