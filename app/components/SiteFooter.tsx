import Image from 'next/image';
import Link from 'next/link';

const LINKS = [
  { href: '/', label: 'Offers' },
  { href: '/?ending=1', label: 'Ending soon' },
  { href: '/register', label: 'List your offer' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
];

const WIDTHS = { lg: 'max-w-5xl', xl: 'max-w-6xl' } as const;

export default function SiteFooter({ width = 'xl' }: { width?: keyof typeof WIDTHS }) {
  return (
    <footer className="mt-auto shrink-0 border-t border-coal/10 bg-paper">
      <div
        className={`mx-auto flex ${WIDTHS[width]} flex-wrap items-center justify-between gap-x-8 gap-y-3 px-4 py-4 sm:px-6`}
      >
        <div className="flex items-center gap-2.5">
          <Image
            src="/brand/logo-mark.webp"
            alt=""
            width={11}
            height={18}
            unoptimized
            className="h-[18px] w-auto object-contain"
          />
          <p className="text-[12px] text-coal/45">
            © {new Date().getFullYear()} OfferCeylon, an{' '}
            <span className="font-medium text-coal/60">Olyntox (Pvt) Ltd</span> company
          </p>
        </div>

        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-coal/50">
          {LINKS.map((l) => (
            <Link key={l.label} href={l.href} className="transition hover:text-flame-deep">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
