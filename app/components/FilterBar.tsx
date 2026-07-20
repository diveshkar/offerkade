'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { SearchIcon, ClockIcon } from '@/app/components/Icons';
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

  const control =
    'h-12 rounded-xl border border-coal/15 bg-paper-soft text-coal-deep outline-none transition focus:border-flame focus:ring-2 focus:ring-flame/25 dark:border-white/10 dark:bg-coal-soft dark:text-paper';

  return (
    <div className="flex flex-col gap-3.5">
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
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-coal/35 dark:text-paper/35"
          >
            <SearchIcon className="h-[18px] w-[18px]" />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pizza, sofas, coffee…"
            aria-label="Search offers"
            className={`${control} w-full pl-11 pr-[104px] text-[15px] placeholder:text-coal/35 dark:placeholder:text-paper/35`}
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 h-9 -translate-y-1/2 rounded-lg bg-flame px-4 text-sm font-semibold text-coal-deep transition hover:brightness-105 active:scale-[0.98]"
          >
            Search
          </button>
        </form>

        <div className="flex gap-2.5">
          <select
            value={activeCity}
            onChange={(e) => update({ city: e.target.value || null })}
            aria-label="Filter by city"
            className={`${control} flex-1 cursor-pointer appearance-none px-4 pr-10 text-sm font-medium sm:flex-none`}
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1.5 6 6.5 11 1.5' stroke='%23a1a1aa' stroke-width='1.8' stroke-linecap='round'/%3E%3C/svg%3E\")",
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.95rem center',
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
            className={`flex h-12 items-center gap-1.5 whitespace-nowrap rounded-xl border px-4 text-sm font-semibold transition active:scale-[0.98] ${
              endingSoon
                ? 'border-ember bg-ember text-white'
                : 'border-coal/15 bg-paper-soft text-coal/70 hover:border-ember/50 hover:text-ember dark:border-white/10 dark:bg-coal-soft dark:text-paper/70'
            }`}
          >
            <ClockIcon /> Ending soon
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
            {c.name}
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
          ? 'border-coal bg-coal text-paper dark:border-flame dark:bg-flame dark:text-coal-deep'
          : 'border-coal/15 bg-paper-soft text-coal/70 hover:border-flame/60 hover:text-coal dark:border-white/10 dark:bg-coal-soft dark:text-paper/70 dark:hover:text-paper'
      }`}
    >
      {children}
    </button>
  );
}
