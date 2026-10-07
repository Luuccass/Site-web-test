import { ViewTransition } from "react";

// M6 « Passer la porte »: on client-side navigation the page content fades out, and the next page
// fades in with an 8 px rise, while the header stays put. A template remounts on every navigation
// (a layout persists), so the enter/exit animations fire. Browsers without view transitions just
// swap the page; reduced motion removes the animation (globals.css).
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="page-enter" exit="page-exit" default="none">
      <div>{children}</div>
    </ViewTransition>
  );
}
