import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

const FOCUS = 'outline-none focus:border-flame focus:ring-2 focus:ring-flame/25';
// min-w-0 lets native date inputs (which have a wide intrinsic size) shrink
// to their container instead of forcing horizontal overflow on small screens.
const CONTROL = `h-11 w-full min-w-0 rounded-xl border border-coal/15 bg-paper-soft px-3.5 text-[15px] text-coal-deep transition placeholder:text-coal/35 ${FOCUS}`;

const INVALID = 'border-ember/60 focus:border-ember focus:ring-ember/25';

const BUTTON_BASE =
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50';

const SIZES = {
  md: 'h-11 px-5 text-sm',
  sm: 'h-9 px-4 text-[13px]',
} as const;

type Size = keyof typeof SIZES;

const VARIANTS = {
  primary: 'bg-flame text-coal-deep hover:brightness-105',
  secondary: 'border border-coal/15 bg-paper-soft text-coal-deep hover:border-coal/30',
  danger: 'border border-ember/30 bg-ember/5 text-ember hover:bg-ember/10',
} as const;

type Variant = keyof typeof VARIANTS;

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ComponentProps<'button'> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={`${BUTTON_BASE} ${SIZES[size]} ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return (
    <Link className={`${BUTTON_BASE} ${SIZES[size]} ${VARIANTS[variant]} ${className}`} {...props} />
  );
}

export function Field({
  label,
  hint,
  error,
  required,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-coal-deep">
          {label}
          {required && (
            <span className="ml-0.5 text-coal/40" aria-hidden>
              *
            </span>
          )}
        </span>
        {hint && !error && <span className="text-xs text-coal/45">{hint}</span>}
      </span>
      {children}
      {error && <span className="mt-1.5 block text-[13px] text-ember">{error}</span>}
    </label>
  );
}

export function Input({
  invalid,
  className = '',
  ...props
}: ComponentProps<'input'> & { invalid?: boolean }) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={`${CONTROL} ${invalid ? INVALID : ''} ${className}`}
      {...props}
    />
  );
}

export function Textarea({
  invalid,
  className = '',
  ...props
}: ComponentProps<'textarea'> & { invalid?: boolean }) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      className={`w-full rounded-xl border border-coal/15 bg-paper-soft px-3.5 py-3 text-[15px] leading-6 text-coal-deep transition placeholder:text-coal/35 ${FOCUS} ${invalid ? INVALID : ''} ${className}`}
      {...props}
    />
  );
}

export function Select({
  invalid,
  className = '',
  ...props
}: ComponentProps<'select'> & { invalid?: boolean }) {
  return (
    <select
      aria-invalid={invalid || undefined}
      className={`${CONTROL} cursor-pointer appearance-none pr-10 ${invalid ? INVALID : ''} ${className}`}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1.5 6 6.5 11 1.5' stroke='%23120d0a' stroke-width='1.8' stroke-linecap='round'/%3E%3C/svg%3E\")",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 0.9rem center',
      }}
      {...props}
    />
  );
}

export function Card({ className = '', children }: { className?: string; children: ReactNode }) {
  return (
    <div className={`rounded-2xl border border-coal/12 bg-paper-soft p-6 ${className}`}>
      {children}
    </div>
  );
}

export function Alert({
  tone = 'info',
  title,
  children,
}: {
  tone?: 'info' | 'success' | 'error';
  title?: string;
  children?: ReactNode;
}) {
  const tones = {
    info: 'border-coal/12 bg-coal/[0.03] text-coal/75',
    success: 'border-emerald-500/25 bg-emerald-500/8 text-emerald-800',
    error: 'border-ember/25 bg-ember/8 text-ember',
  } as const;

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm leading-6 ${tones[tone]}`}>
      {title && <p className="font-semibold">{title}</p>}
      {children}
    </div>
  );
}

export function StatusPill({
  status,
  size = 'sm',
}: {
  status: string;
  size?: 'sm' | 'md';
}) {
  const tones: Record<string, string> = {
    approved: 'bg-emerald-500/12 text-emerald-700 ring-emerald-500/20',
    pending: 'bg-amber-500/12 text-amber-700 ring-amber-500/25',
    rejected: 'bg-ember/10 text-ember ring-ember/20',
    expired: 'bg-coal/8 text-coal/55 ring-coal/15',
    draft: 'bg-coal/8 text-coal/60 ring-coal/15',
  };
  const tone = tones[status] ?? tones.expired;
  const scale =
    size === 'md' ? 'h-9 rounded-xl px-3.5 text-[13px]' : 'rounded-full px-2.5 py-0.5 text-[11px]';

  return (
    <span
      className={`inline-flex items-center justify-center font-semibold capitalize ring-1 ${scale} ${tone}`}
    >
      {status}
    </span>
  );
}
