'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ITEMS = [
  { href: '/dashboard', label: 'My offers', exact: true },
  { href: '/dashboard/branches', label: 'Branches' },
  { href: '/offers/new', label: 'Post an offer' },
];

export default function DashboardNav({ variant = 'sidebar' }: { variant?: 'sidebar' | 'top' }) {
  const pathname = usePathname();
  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/');

  if (variant === 'top') {
    return (
      <nav className="flex items-center gap-1.5 overflow-x-auto">
        {ITEMS.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-[13px] font-semibold transition ${
              isActive(it.href, it.exact)
                ? 'bg-flame text-coal-deep'
                : 'text-paper/70 hover:bg-white/10 hover:text-paper'
            }`}
          >
            {it.label}
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <nav className="flex flex-col gap-1">
      {ITEMS.map((it) => {
        const active = isActive(it.href, it.exact);
        return (
          <Link
            key={it.href}
            href={it.href}
            className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
              active
                ? 'bg-flame text-coal-deep shadow-sm'
                : 'text-paper/70 hover:bg-white/10 hover:text-paper'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-coal-deep' : 'bg-paper/30'}`}
              aria-hidden
            />
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
