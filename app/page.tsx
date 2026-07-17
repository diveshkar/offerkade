import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-amber-50 via-white to-white px-6 text-center dark:from-[#0b1220] dark:via-[#0b1220] dark:to-black">
      <main className="flex w-full max-w-2xl flex-col items-center gap-6 py-20">
        <div className="rounded-3xl bg-[#10182b] px-7 py-6 shadow-xl shadow-zinc-900/10 ring-1 ring-zinc-900/5 dark:shadow-none dark:ring-white/10">
          <Image
            src="/brand/logo-lockup.webp"
            alt="OfferCeylon"
            width={720}
            height={973}
            priority
            unoptimized
            className="h-auto w-[180px] sm:w-[210px]"
          />
        </div>

        {/* Tagline (real text, not baked into the logo) */}
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
          Sri Lanka&apos;s Daily Offers Hub
        </p>

        <h1 className="mt-2 text-4xl font-extrabold leading-tight tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
          Sri Lanka&apos;s offers,
          <br />
          <span className="text-amber-500">all in one place.</span>
        </h1>

        <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Restaurants, shops, furniture, drinks. Every current deal on the
          island, free to browse. Save money every day.
        </p>

        <span className="rounded-full border border-amber-300 bg-amber-100 px-4 py-1.5 text-sm font-semibold text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
          🚧 Coming soon
        </span>

        {/* Business CTA (real submission form arrives in Phase 5) */}
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
