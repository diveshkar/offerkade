import Image from 'next/image';
import Link from 'next/link';

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/85 text-white backdrop-blur-xl supports-[backdrop-filter]:bg-ink/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-2.5 rounded-lg"
          aria-label="OfferCeylon home"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-accent to-accent-strong shadow-lg shadow-accent/25 transition-transform duration-300 group-hover:scale-105">
            <Image
              src="/brand/logo-mark.webp"
              alt=""
              width={26}
              height={26}
              unoptimized
              className="h-[26px] w-[26px]"
            />
          </span>
          <span className="text-[17px] font-extrabold tracking-tight">
            Offer<span className="text-accent">Ceylon</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 text-sm font-medium">
          <Link
            href="/"
            className="hidden rounded-full px-4 py-2 text-zinc-300 transition hover:bg-white/10 hover:text-white sm:block"
          >
            Offers
          </Link>
          <Link
            href="/about"
            className="hidden rounded-full px-4 py-2 text-zinc-300 transition hover:bg-white/10 hover:text-white sm:block"
          >
            About
          </Link>
          <Link
            href="/submit"
            className="ml-1 rounded-full bg-gradient-to-b from-accent to-accent-strong px-4 py-2 font-semibold text-brand shadow-md shadow-accent/25 transition hover:brightness-105 active:scale-[0.98]"
          >
            List your offer
          </Link>
        </nav>
      </div>
    </header>
  );
}
