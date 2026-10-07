import { frenchDate, publishableExcerpts, reviews } from "@/lib/data";

// Google rating line (dated, linked) and, when author + date are known, short review excerpts with the
// legally required notice. No excerpt is shown without its author and date.
export function Reviews({ compact = false }: { compact?: boolean }) {
  const r = reviews.rating;
  const rating = `${String(r.value).replace(".", ",")}/5 sur Google, ${r.count} avis au ${frenchDate(r.asOf)}`;
  if (compact) {
    return (
      <p className="mx-auto flex max-w-[84rem] flex-wrap items-center gap-x-4 gap-y-1 px-4 py-5 sm:px-8 lg:px-12">
        <span>{rating}</span>
        <a href={reviews.listingUrl} className="inline-flex min-h-11 items-center underline" rel="noopener">
          Lire les avis sur Google
        </a>
      </p>
    );
  }
  if (publishableExcerpts.length === 0) return null;
  return (
    <section aria-labelledby="avis" className="mx-auto max-w-[84rem] px-4 py-16 sm:px-8 sm:py-24 lg:px-12">
      <h2 id="avis" className="text-[length:var(--text-h2)]">
        Ce qu&apos;en disent nos clients
      </h2>
      <ul className="mt-10 grid gap-10 md:grid-cols-3">
        {publishableExcerpts.slice(0, 3).map((e) => (
          <li key={e.id}>
            <figure>
              <blockquote className="text-[1.25rem] italic leading-normal">«&#8239;{e.text}&#8239;»</blockquote>
              <figcaption className="mt-3 text-ink-soft">
                {e.author}, avis Google du {e.date}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
      <p className="mt-10 text-[1rem] text-ink-soft">
        {reviews.disclaimer} Note moyenne {rating}.{" "}
        <a href={reviews.listingUrl} className="underline" rel="noopener">
          Tous les avis sur Google
        </a>
      </p>
    </section>
  );
}
