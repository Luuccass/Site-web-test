import type { ReactNode } from "react";

// M2m « La porte s'ouvre »: the photo is revealed by two navy leaves sliding apart (translateX only)
// the first time it enters the screen. Without JS or with reduced motion: no leaves, photo visible.
export function Door({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`door ${className}`}>
      <div className="door__photo">{children}</div>
      <span aria-hidden="true" className="door__leaf door__leaf--left" />
      <span aria-hidden="true" className="door__leaf door__leaf--right" />
    </div>
  );
}
