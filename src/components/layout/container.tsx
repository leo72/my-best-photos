import type { ReactNode } from 'react';

type ContainerSize = 'default' | 'wide';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'main' | 'section' | 'header' | 'footer';
  size?: ContainerSize;
}

const sizeClasses: Record<ContainerSize, string> = {
  default: 'max-w-6xl',
  wide: 'max-w-7xl',
};

export function Container({
  children,
  className = '',
  as: Tag = 'div',
  size = 'default',
}: ContainerProps) {
  return (
    <Tag
      className={`mx-auto w-full ${sizeClasses[size]} px-4 sm:px-6 lg:px-8 ${className}`}
    >
      {children}
    </Tag>
  );
}
