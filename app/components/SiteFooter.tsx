import Image from 'next/image';
import Link from 'next/link';

const WIDTHS = { lg: 'max-w-5xl', xl: 'max-w-6xl' } as const;

export default function SiteFooter({ width = 'xl' }: { width?: keyof typeof WIDTHS }) {
  return (
    <footer className="mt-auto border-t border-flame/15 bg-coal-deep text-paper/60">
      <div className={`mx-auto ${WIDTHS[width]} px-4 py-12 sm:px-6`}>
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          {/* Brand block */}
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-flame-bright to-flame-deep">
                <Image
                  src="/brand/logo-mark.webp"
                  alt=""
                  width={12}
                  height={20}
                  unoptimized
                  className="h-5 w-auto object-contain"
                />
              </span>
              <span className="font-display text-base font-semibold tracking-tight text-paper">
                Offer<span className="text-flame">Ceylon</span>
              </span>
            </div>
            <p className="mt-3 text-sm leading-6">
              Sri Lanka&apos;s offers in one place. Every current deal on the island, free to
              browse, gone the moment it expires.
            </p>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-10 text-sm sm:gap-16">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-flame/70">
                Explore
              </p>
              <ul className="flex flex-col gap-2.5">
                <li><Link href="/" className="transition hover:text-flame-bright">All offers</Link></li>
                <li><Link href="/?ending=1" className="transition hover:text-flame-bright">Ending soon</Link></li>
                <li><Link href="/register" className="transition hover:text-flame-bright">List your offer</Link></li>
              </ul>
            </div>
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-flame/70">
                Company
              </p>
              <ul className="flex flex-col gap-2.5">
                <li><Link href="/about" className="transition hover:text-flame-bright">About</Link></li>
                <li><Link href="/contact" className="transition hover:text-flame-bright">Contact</Link></li>
                <li><Link href="/privacy" className="transition hover:text-flame-bright">Privacy</Link></li>
                <li><Link href="/terms" className="transition hover:text-flame-bright">Terms</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-paper/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} OfferCeylon · An{' '}
            <span className="font-semibold text-paper/60">Olyntox (Pvt) Ltd</span> company. Made in
            Sri Lanka 🇱🇰
          </p>
          <p>Offers are posted by businesses and auto-expire on their end date.</p>
        </div>
      </div>
    </footer>
  );
}
