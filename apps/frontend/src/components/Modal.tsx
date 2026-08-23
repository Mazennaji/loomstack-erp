import { useEffect, type ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
}

export default function Modal({ open, onClose, title, description, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        onClick={onClose}
        className="absolute inset-0 bg-navy/40 backdrop-blur-sm"
        style={{ animation: 'modalFade 0.2s ease-out both' }}
      />

      <div
        className="relative w-full max-w-md overflow-hidden rounded-xl border border-line bg-surface shadow-xl"
        style={{ animation: 'modalRise 0.24s cubic-bezier(0.16, 1, 0.3, 1) both' }}
      >
        <div className="absolute inset-x-0 top-0 h-0.5 bg-signal" />

        <div className="flex items-start justify-between gap-4 px-6 pt-6">
          <div>
            <h2 className="font-display text-lg font-600 tracking-tight text-ink">{title}</h2>
            {description && <p className="mt-1 text-sm text-muted">{description}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 -mt-1 flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-line/50 hover:text-ink focus:outline-none focus:ring-2 focus:ring-signal-soft"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M12 4L4 12M4 4l8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="px-6 pb-6 pt-5">{children}</div>
      </div>
    </div>
  );
}