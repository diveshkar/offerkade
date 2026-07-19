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
        {/* Compact navy band keeps brand continuity on inner pages */}
        <section className="relative overflow-hidden bg-ink pb-12 pt-12 text-white">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl"
          />
          <div className="relative mx-auto max-w-3xl px-4 sm:px-6">
            <h1 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
              {title}
            </h1>
          </div>
        </section>

        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <div className="animate-rise flex flex-col gap-4 leading-7 text-zinc-600 dark:text-zinc-300">
            {children}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
