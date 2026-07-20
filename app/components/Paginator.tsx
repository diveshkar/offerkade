import Link from 'next/link';

// Builds a compact page list like: 1 … 4 5 [6] 7 8 … 20
function pageList(page: number, totalPages: number): (number | 'gap')[] {
  const out: (number | 'gap')[] = [];
  const push = (n: number) => out.push(n);
  const window = 1; // pages either side of current
  const first = 1;
  const last = totalPages;

  for (let n = first; n <= last; n++) {
    if (n === first || n === last || (n >= page - window && n <= page + window)) {
      push(n);
    } else if (out[out.length - 1] !== 'gap') {
      out.push('gap');
    }
  }
  return out;
}

export default function Paginator({
  page,
  totalPages,
  hrefFor,
}: {
  page: number;
  totalPages: number;
  hrefFor: (p: number) => string;
}) {
  if (totalPages <= 1) return null;

  const base =
    'grid h-10 min-w-10 place-items-center rounded-lg border px-3 text-sm font-medium transition';
  const idle =
    'border-coal/15 bg-paper-soft text-coal/70 hover:border-flame/50 hover:text-flame-deep dark:border-white/12 dark:bg-coal-soft dark:text-paper/70 dark:hover:text-flame-bright';
  const active = 'border-flame bg-flame text-coal-deep';
  const disabled = 'pointer-events-none border-coal/10 text-coal/25 dark:border-white/8 dark:text-paper/25';

  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
    >
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={`${base} ${idle}`} rel="prev" aria-label="Previous page">
          ← Prev
        </Link>
      ) : (
        <span className={`${base} ${disabled}`} aria-hidden>← Prev</span>
      )}

      {pageList(page, totalPages).map((p, i) =>
        p === 'gap' ? (
          <span key={`gap-${i}`} className="px-1 text-coal/35 dark:text-paper/35" aria-hidden>
            …
          </span>
        ) : p === page ? (
          <span key={p} aria-current="page" className={`${base} ${active}`}>
            {p}
          </span>
        ) : (
          <Link key={p} href={hrefFor(p)} className={`${base} ${idle}`} aria-label={`Page ${p}`}>
            {p}
          </Link>
        ),
      )}

      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} className={`${base} ${idle}`} rel="next" aria-label="Next page">
          Next →
        </Link>
      ) : (
        <span className={`${base} ${disabled}`} aria-hidden>Next →</span>
      )}
    </nav>
  );
}
