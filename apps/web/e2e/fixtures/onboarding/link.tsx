import React from 'react';

// A local navigation stand-in for Vite; production uses Next's real Link.
export default function Link({
  href,
  onNavigate,
  children,
  ...props
}: React.ComponentProps<'a'> & { onNavigate?: () => void }) {
  return (
    <a
      {...props}
      href={href}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        onNavigate?.();
        window.history.pushState(null, '', href);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }}
    >
      {children}
    </a>
  );
}
