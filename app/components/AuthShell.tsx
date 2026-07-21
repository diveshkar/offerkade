import type { ReactNode } from 'react';
import SiteHeader from '@/app/components/SiteHeader';
import SiteFooter from '@/app/components/SiteFooter';

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-paper">
        <div className="mx-auto w-full max-w-md px-4 py-14 sm:px-6 sm:py-20">
          <div className="mb-7 text-center">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-coal-deep">
              {title}
            </h1>
            {subtitle && <p className="mt-2 text-[15px] leading-6 text-coal/60">{subtitle}</p>}
          </div>

          <div className="rounded-2xl border border-coal/12 bg-paper-soft p-6 sm:p-7">{children}</div>

          {footer && <div className="mt-6 text-center text-sm text-coal/60">{footer}</div>}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
