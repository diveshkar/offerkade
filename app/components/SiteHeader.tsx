import Image from 'next/image';
import Link from 'next/link';

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-flame/15 bg-coal-deep/90 text-paper backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-2.5 rounded-lg"
          aria-label="OfferCeylon home"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-flame-bright to-flame-deep shadow-lg shadow-flame/20 transition-transform duration-300 group-hover:rotate-6">
            <Image
              src="/brand/logo-mark.webp"
              alt=""
              width={14}
              height={24}
              unoptimized
              className="h-6 w-auto object-contain"
            />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">
            Offer<span className="text-flame">Ceylon</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 text-sm font-medium">
          <Link
            href="/about"
            className="hidden rounded-full px-4 py-2 text-paper/75 transition hover:bg-white/10 hover:text-paper sm:block"
          >
            About
          </Link>
          <Link
            href="/register"
            className="ml-1 rounded-full bg-gradient-to-b from-flame-bright to-flame px-4 py-2 font-semibold text-coal-deep shadow-md shadow-flame/25 transition hover:brightness-105 active:scale-[0.98]"
          >
            List your offer
          </Link>
        </nav>
      </div>
    </header>
  );
}
