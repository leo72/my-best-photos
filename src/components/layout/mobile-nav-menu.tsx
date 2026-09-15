import {
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  useEffect,
  useId,
  useState,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';

interface MobileNavMenuProps {
  children: (close: () => void) => ReactNode;
}

export function MobileNavMenu({ children }: MobileNavMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuId = useId();
  const location = useLocation();

  function close(): void {
    setIsOpen(false);
  }

  useEffect(() => {
    close();
  }, [location.pathname, location.hash, location.search]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        close();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        className="inline-flex size-10 cursor-pointer items-center justify-center rounded-xl text-slate-700 transition-colors hover:bg-slate-100"
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        onClick={() => {
          setIsOpen((open) => !open);
        }}
      >
        {isOpen ? (
          <XMarkIcon className="size-6" aria-hidden="true" />
        ) : (
          <Bars3Icon className="size-6" aria-hidden="true" />
        )}
      </button>

      {isOpen ? (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 top-16 z-40 cursor-default border-0 bg-slate-950/20 p-0"
            onClick={close}
          />
          <nav
            id={menuId}
            aria-label="Primary"
            className="fixed inset-x-0 top-16 z-50 max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-slate-200 bg-white px-4 py-3 shadow-lg"
          >
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-1">
              {children(close)}
            </div>
          </nav>
        </>
      ) : null}
    </div>
  );
}
