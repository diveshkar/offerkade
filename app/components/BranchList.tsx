import { PinIcon } from '@/app/components/Icons';
import type { Branch } from '@/lib/database.types';

function mapsHref(b: Branch) {
  if (b.lat !== null && b.lng !== null) {
    return `https://www.google.com/maps/search/?api=1&query=${b.lat},${b.lng}`;
  }
  const q = [b.address, b.city, b.district, 'Sri Lanka'].filter(Boolean).join(', ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

export default function BranchList({ branches }: { branches: Branch[] }) {
  if (branches.length === 0) return null;

  return (
    <section className="rounded-2xl border border-coal/12 bg-paper-soft p-5 dark:border-white/10 dark:bg-coal-soft">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-coal/40 dark:text-paper/40">
          {branches.length === 1 ? 'Where to redeem' : 'Available at these branches'}
        </h2>
        {branches.length > 1 && (
          <span className="text-[13px] font-semibold text-coal/50 dark:text-paper/50">
            {branches.length} locations
          </span>
        )}
      </div>

      <ul className="flex flex-col gap-3">
        {branches.map((b) => {
          const heading = b.label || [b.city, b.district].filter(Boolean).join(', ') || b.district;
          const showDistrict = Boolean(b.label) || Boolean(b.city);

          return (
            <li
              key={b.id}
              className="flex items-start gap-3 rounded-xl border border-coal/10 bg-paper p-3.5 dark:border-white/10 dark:bg-white/5"
            >
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-flame/12 text-flame-deep dark:text-flame-bright">
                <PinIcon className="h-4 w-4" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-coal-deep dark:text-paper">{heading}</p>
                {showDistrict && (
                  <p className="mt-0.5 text-[13px] text-coal/50 dark:text-paper/50">
                    {b.district} District
                  </p>
                )}
                {b.address && (
                  <p className="mt-1 text-[13px] leading-6 text-coal/65 dark:text-paper/65">
                    {b.address}
                  </p>
                )}
              </div>

              <a
                href={mapsHref(b)}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-lg border border-coal/15 px-3 py-1.5 text-[13px] font-semibold text-coal-deep transition hover:border-flame hover:text-flame-deep dark:border-white/15 dark:text-paper dark:hover:text-flame-bright"
              >
                Directions
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
