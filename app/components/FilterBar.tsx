'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import type { Category } from '@/lib/database.types';

export default function FilterBar({
  categories,
  cities,
}: {
  categories: Category[];
  cities: string[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [search, setSearch] = useState(params.get('q') ?? '');

  const activeCat = params.get('category') ?? '';
  const activeCity = params.get('city') ?? '';
  const endingSoon = params.get('ending') === '1';

  function update(next: Record<string, string | null>) {
    const p = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v === null || v === '') p.delete(k);
      else p.set(k, v);
    }
    const qs = p.toString();
    router.push(qs ? `/?${qs}` : '/', { scroll: false });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Row 1: search / city / ending soon */}
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            update({ q: search || null });
          }}
          className="relative flex-1"
          role="search"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-forest/35 dark:text-ivory/35"
          >
            🔍
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pizza, sofas, coffee…"
            aria-label="Search offers"
            className="h-11 w-full rounded-full border border-forest/15 bg-ivory-soft pl-10 pr-24 text-[15px] shadow-sm outline-none transition placeholder:text-forest/35 focus:border-gold focus:ring-2 focus:ring-gold/30 dark:border-white/10 dark:bg-forest-soft dark:placeholder:text-ivory/35"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 h-8 -translate-y-1/2 rounded-full bg-forest px-4 text-sm font-semibold text-ivory transition hover:bg-forest-soft active:scale-[0.97]"
          >
            Search
          </button>
        </form>

        <div className="flex gap-2.5">
          <select
            value={activeCity}
            onChange={(e) => update({ city: e.target.value || null })}
            aria-label="Filter by city"
            className="h-11 flex-1 cursor-pointer appearance-none rounded-full border border-forest/15 bg-ivory-soft px-4 pr-9 text-sm font-medium shadow-sm outline-none transition focus:border-gold sm:flex-none dark:border-white/10 dark:bg-forest-soft"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1.5 6 6.5 11 1.5' stroke='%23a1a1aa' stroke-width='1.8' stroke-linecap='round'/%3E%3C/svg%3E\")",
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.9rem center',
            }}
          >
            <option value="">All cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <button
            onClick={() => update({ ending: endingSoon ? null : '1' })}
            aria-pressed={endingSoon}
            className={`h-11 whitespace-nowrap rounded-full border px-4 text-sm font-semibold shadow-sm transition active:scale-[0.97] ${
              endingSoon
                ? 'border-clay bg-clay text-white shadow-clay/25'
                : 'border-forest/15 bg-ivory-soft text-forest/70 hover:border-clay/50 hover:text-clay dark:border-white/10 dark:bg-forest-soft dark:text-ivory/70'
            }`}
          >
            ⏰ Ending soon
          </button>
        </div>
      </div>

      {/* Row 2: category rail */}
      <div className="scrollbar-hide -mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5">
        <Chip active={!activeCat} onClick={() => update({ category: null })}>
          All
        </Chip>
        {categories.map((c) => (
          <Chip
            key={c.slug}
            active={activeCat === c.slug}
            onClick={() => update({ category: c.slug })}
          >
            <span aria-hidden>{c.icon}</span> {c.name}
          </Chip>
        ))}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition active:scale-[0.96] ${
        active
          ? 'border-forest bg-forest text-ivory shadow-md shadow-forest/25 dark:border-gold dark:bg-gold dark:text-forest-deep'
          : 'border-forest/15 bg-ivory-soft text-forest/70 hover:border-gold/60 hover:text-forest dark:border-white/10 dark:bg-forest-soft dark:text-ivory/70 dark:hover:text-ivory'
      }`}
    >
      {children}
    </button>
  );
}
