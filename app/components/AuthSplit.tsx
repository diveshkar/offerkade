import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

const POINTS = [
  'Reach shoppers across all 25 districts',
  'Your offers go live the moment you post',
  'Free to list, no commission, ever',
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
    <div className="grid min-h-dvh lg:grid-cols-2">
      <section className="flex flex-col bg-paper">
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
            <span className="font-display text-lg font-semibold tracking-tight text-coal-deep">
              Offer<span className="text-flame">Ceylon</span>
            </span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-sm">
            <h1 className="font-display text-[32px] font-semibold leading-tight tracking-tight text-coal-deep">
              {title}
            </h1>
            {subtitle && <p className="mt-2 text-[15px] leading-6 text-coal/60">{subtitle}</p>}

            <div className="mt-8">{children}</div>

            {footer && <div className="mt-7 text-sm text-coal/60">{footer}</div>}
          </div>
        </div>
      </section>

      <section className="relative hidden overflow-hidden bg-coal-deep lg:block">
        <Image
          src="/brand/bg-warm.webp"
          alt=""
          fill
          sizes="50vw"
          priority
          className="object-cover"
        />
        <div aria-hidden className="absolute inset-0 bg-coal-deep/55" />

        <div className="relative flex h-full flex-col justify-between p-12 xl:p-16">
          <Image
            src="/brand/logo-mark.webp"
            alt=""
            width={64}
            height={110}
            unoptimized
            className="h-28 w-auto object-contain drop-shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
          />

          <div className="max-w-md">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-flame">
              For businesses
            </p>
            <p className="font-display mt-4 text-[34px] font-semibold leading-[1.15] text-white xl:text-[40px]">
              Put your deal in front of the whole island.
            </p>

            <ul className="mt-9 flex flex-col gap-4">
              {POINTS.map((point) => (
                <li key={point} className="flex items-start gap-3 text-[15px] text-white/85">
                  <span
                    aria-hidden
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-flame"
                  />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-[13px] text-white/45">
            Sri Lanka&apos;s offers in one place.
          </p>
        </div>
      </section>
    </div>
  );
}
