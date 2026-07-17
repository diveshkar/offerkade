export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-white px-6 text-center dark:from-zinc-950 dark:to-black">
      <main className="flex w-full max-w-2xl flex-col items-center gap-8 py-24">
        {/* Logo mark */}
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-2xl font-black text-white shadow-lg shadow-amber-500/30">
            O
          </span>
          <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Offer<span className="text-amber-500">Ceylon</span>
          </span>
        </div>

        {/* Hero */}
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
          Sri Lanka&apos;s offers,
          <br />
          <span className="text-amber-500">all in one place.</span>
        </h1>

        <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Restaurants, shops, furniture, drinks — every current deal on the
          island, free to browse. Save money every day.
        </p>

        {/* Coming soon badge */}
        <span className="rounded-full border border-amber-300 bg-amber-100 px-4 py-1.5 text-sm font-semibold text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
          🚧 Coming soon
        </span>

        {/* Business CTA (submission comes in Phase 5) */}
        <div className="mt-4 flex flex-col items-center gap-3 text-sm text-zinc-500 dark:text-zinc-500">
          <p>Are you a business with a current offer?</p>
          <a
            href="mailto:hello@offerceylon.lk"
            className="font-medium text-amber-600 underline-offset-4 hover:underline dark:text-amber-400"
          >
            Get listed free →
          </a>
        </div>
      </main>

      <footer className="pb-8 text-xs text-zinc-400 dark:text-zinc-600">
        © {new Date().getFullYear()} OfferCeylon · Sri Lanka
      </footer>
    </div>
  );
}
