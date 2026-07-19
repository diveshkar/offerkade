import SiteHeader from '@/app/components/SiteHeader';
import SiteFooter from '@/app/components/SiteFooter';

// Wrapper for simple content pages (About, Privacy, etc.).
export default function PageShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Brand band keeps continuity on inner pages */}
        <section className="relative overflow-hidden bg-coal-deep pb-14 pt-14 text-paper">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 right-[-6%] h-64 w-64 rounded-full bg-flame/12 blur-3xl"
          />
          <div className="relative mx-auto max-w-3xl px-4 sm:px-6">
            <p className="mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-flame">
              <span className="h-px w-8 bg-flame/60" aria-hidden />
              OfferCeylon
            </p>
            <h1 className="font-display text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
              {title}
            </h1>
          </div>
        </section>

        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <div className="animate-rise flex flex-col gap-4 leading-7 text-coal/75 dark:text-paper/75">
            {children}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
