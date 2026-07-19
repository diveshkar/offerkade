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
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          {title}
        </h1>
        <div className="prose-ok flex flex-col gap-4 leading-7 text-zinc-600 dark:text-zinc-300">
          {children}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
