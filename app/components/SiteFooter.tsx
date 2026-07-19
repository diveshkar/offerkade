import Image from 'next/image';
import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-gold/15 bg-forest-deep text-ivory/60">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          {/* Brand block */}
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-gold-bright to-gold-deep">
                <Image
                  src="/brand/logo-mark.webp"
                  alt=""
                  width={20}
                  height={20}
                  unoptimized
                  className="h-5 w-5"
                />
              </span>
              <span className="font-display text-base font-semibold tracking-tight text-ivory">
                Offer<span className="text-gold">Ceylon</span>
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
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gold/70">
                Explore
              </p>
              <ul className="flex flex-col gap-2.5">
                <li><Link href="/" className="transition hover:text-gold-bright">All offers</Link></li>
                <li><Link href="/?ending=1" className="transition hover:text-gold-bright">Ending soon</Link></li>
                <li><Link href="/submit" className="transition hover:text-gold-bright">List your offer</Link></li>
              </ul>
            </div>
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gold/70">
                Company
              </p>
              <ul className="flex flex-col gap-2.5">
                <li><Link href="/about" className="transition hover:text-gold-bright">About</Link></li>
                <li><Link href="/contact" className="transition hover:text-gold-bright">Contact</Link></li>
                <li><Link href="/privacy" className="transition hover:text-gold-bright">Privacy</Link></li>
                <li><Link href="/terms" className="transition hover:text-gold-bright">Terms</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-ivory/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} OfferCeylon. Made in Sri Lanka 🇱🇰</p>
          <p>Offers are posted by businesses and auto-expire on their end date.</p>
        </div>
      </div>
    </footer>
  );
}
