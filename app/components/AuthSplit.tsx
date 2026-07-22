import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

const POINTS = [
  'Reach shoppers across all 25 districts',
  'Your offers go live the moment you post',
  'One dashboard for every branch you run',
];

export default function AuthSplit({
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
    <div className="bg-hero relative grid min-h-dvh overflow-hidden lg:grid-cols-2 lg:bg-none">
      {/* Mobile watermark: taller than the card, so it reads above and below it. */}
      <Image
        src="/brand/logo-mark.webp"
        alt=""
        width={420}
        height={725}
        unoptimized
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[88%] w-auto -translate-x-1/2 -translate-y-1/2 object-contain opacity-[0.16] lg:hidden"
      />

      {/* Below lg the orange sits behind the form, so the card floats on it. */}
      <section className="relative flex flex-col lg:bg-paper">
        <div className="px-6 pt-8 sm:px-10">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <Image
              src="/brand/logo-mark.webp"
              alt=""
              width={13}
              height={22}
              unoptimized
              className="h-[22px] w-auto object-contain"
            />
            <span className="font-display text-lg font-semibold tracking-tight text-white lg:text-coal-deep">
              Offer<span className="text-amber-200 lg:text-flame">Ceylon</span>
            </span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-10 sm:py-12">
          <div className="w-full max-w-sm max-lg:rounded-2xl max-lg:bg-paper max-lg:p-6 max-lg:shadow-[0_24px_60px_-24px_rgba(60,20,4,0.55)]">
            <h1 className="font-display text-[28px] font-semibold leading-tight tracking-tight text-coal-deep sm:text-[32px]">
              {title}
            </h1>
            {subtitle && <p className="mt-2 text-[15px] leading-6 text-coal/60">{subtitle}</p>}

            <div className="mt-8">{children}</div>

            {footer && <div className="mt-7 text-sm text-coal/60">{footer}</div>}
          </div>
        </div>
      </section>

      <section className="bg-hero relative hidden overflow-hidden lg:block">
        {/* Oversized mark, fully inside the panel. Texture, not a focal point. */}
        <Image
          src="/brand/logo-mark.webp"
          alt=""
          width={420}
          height={725}
          unoptimized
          aria-hidden
          className="pointer-events-none absolute right-10 top-1/2 h-[58%] w-auto -translate-y-1/2 object-contain opacity-[0.13] xl:right-16"
        />

        <div className="relative flex h-full flex-col justify-center p-12 xl:p-16">
          <div className="max-w-md">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-100">
              For businesses
            </p>
            <p className="font-display mt-4 text-[34px] font-semibold leading-[1.15] text-white xl:text-[40px]">
              Put your deal in front of the whole island.
            </p>

            <ul className="mt-9 flex flex-col gap-4">
              {POINTS.map((point) => (
                <li key={point} className="flex items-start gap-3 text-[15px] text-white/90">
                  <span
                    aria-hidden
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-200"
                  />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <p className="absolute bottom-12 left-12 text-[13px] text-white/60 xl:bottom-16 xl:left-16">
            Sri Lanka&apos;s offers in one place.
          </p>
        </div>
      </section>
    </div>
  );
}
