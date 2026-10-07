// Runs synchronously while the HTML is parsed (hard loads), before the first paint.
// On the client it renders as text/plain so React does not try to execute or warn about it.
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
