import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-[#0b1220]">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between dark:text-zinc-400">
        <p>© {new Date().getFullYear()} OfferCeylon · Sri Lanka&apos;s offers in one place.</p>
        <nav className="flex flex-wrap gap-x-4 gap-y-1">
          <Link href="/about" className="hover:text-amber-600">About</Link>
          <Link href="/contact" className="hover:text-amber-600">Contact</Link>
          <Link href="/privacy" className="hover:text-amber-600">Privacy</Link>
          <Link href="/terms" className="hover:text-amber-600">Terms</Link>
        </nav>
      </div>
    </footer>
  );
}
