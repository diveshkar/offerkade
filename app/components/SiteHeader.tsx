import Image from 'next/image';
import Link from 'next/link';

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-gold/15 bg-forest-deep/90 text-ivory backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-2.5 rounded-lg"
          aria-label="OfferCeylon home"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-gold-bright to-gold-deep shadow-lg shadow-gold/20 transition-transform duration-300 group-hover:rotate-6">
            <Image
              src="/brand/logo-mark.webp"
              alt=""
              width={24}
              height={24}
              unoptimized
              className="h-6 w-6"
            />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">
            Offer<span className="text-gold">Ceylon</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 text-sm font-medium">
          <Link
            href="/"
            className="hidden rounded-full px-4 py-2 text-ivory/75 transition hover:bg-white/10 hover:text-ivory sm:block"
          >
            Offers
          </Link>
          <Link
            href="/about"
            className="hidden rounded-full px-4 py-2 text-ivory/75 transition hover:bg-white/10 hover:text-ivory sm:block"
          >
            About
          </Link>
          <Link
            href="/submit"
            className="ml-1 rounded-full bg-gradient-to-b from-gold-bright to-gold px-4 py-2 font-semibold text-forest-deep shadow-md shadow-gold/25 transition hover:brightness-105 active:scale-[0.98]"
          >
            List your offer
          </Link>
        </nav>
      </div>
    </header>
  );
}
