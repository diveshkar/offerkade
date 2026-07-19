import Image from 'next/image';
import Link from 'next/link';

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-[#10182b] text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/brand/logo-mark.webp"
            alt="OfferCeylon"
            width={36}
            height={36}
            unoptimized
            className="h-9 w-9"
          />
          <span className="text-lg font-extrabold tracking-tight">
            Offer<span className="text-amber-500">Ceylon</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm font-medium sm:gap-2">
          <Link href="/" className="rounded-lg px-3 py-1.5 text-zinc-200 hover:bg-white/10">
            Offers
          </Link>
          <Link href="/about" className="rounded-lg px-3 py-1.5 text-zinc-200 hover:bg-white/10">
            About
          </Link>
          <Link
            href="/submit"
            className="rounded-lg bg-amber-500 px-3 py-1.5 font-semibold text-[#10182b] hover:bg-amber-400"
          >
            List free
          </Link>
        </nav>
      </div>
    </header>
  );
}
