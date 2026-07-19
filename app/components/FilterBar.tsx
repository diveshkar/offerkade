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
    <div className="flex flex-col gap-3">
      {/* Search + city + ending-soon */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            update({ q: search || null });
          }}
          className="flex flex-1 gap-2"
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search offers…"
            className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-white/15 dark:bg-[#0b1220]"
          />
          <button
            type="submit"
            className="rounded-lg bg-[#10182b] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1b2540]"
          >
            Search
          </button>
        </form>

        <select
          value={activeCity}
          onChange={(e) => update({ city: e.target.value || null })}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-amber-500 dark:border-white/15 dark:bg-[#0b1220]"
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
          className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
            endingSoon
              ? 'border-red-600 bg-red-600 text-white'
              : 'border-zinc-300 text-zinc-700 hover:border-red-400 dark:border-white/15 dark:text-zinc-200'
          }`}
        >
          ⏰ Ending soon
        </button>
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2">
        <Chip active={!activeCat} onClick={() => update({ category: null })}>
          All
        </Chip>
        {categories.map((c) => (
          <Chip
            key={c.slug}
            active={activeCat === c.slug}
            onClick={() => update({ category: c.slug })}
          >
            {c.icon} {c.name}
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
      className={`whitespace-nowrap rounded-full border px-3 py-1 text-sm font-medium transition ${
        active
          ? 'border-amber-500 bg-amber-500 text-[#10182b]'
          : 'border-zinc-300 text-zinc-700 hover:border-amber-400 dark:border-white/15 dark:text-zinc-200'
      }`}
    >
      {children}
    </button>
  );
}
