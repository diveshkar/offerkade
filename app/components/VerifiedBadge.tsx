import { VerifiedIcon } from '@/app/components/Icons';

// Green "Verified" pill shown next to trusted businesses. Replaces the
// bare ✓ so the trust signal reads clearly.
export default function VerifiedBadge({
  size = 'sm',
  className = '',
}: {
  size?: 'sm' | 'md';
  className?: string;
}) {
  const scale =
    size === 'md'
      ? 'gap-1.5 px-2.5 py-1 text-xs'
      : 'gap-1 px-1.5 py-0.5 text-[10px]';
  const icon = size === 'md' ? 'h-3.5 w-3.5' : 'h-3 w-3';

  return (
    <span
      title="Verified business"
      className={`inline-flex shrink-0 items-center rounded-full bg-emerald-500/12 font-semibold text-emerald-700 ring-1 ring-emerald-500/20 dark:bg-emerald-400/15 dark:text-emerald-300 dark:ring-emerald-400/25 ${scale} ${className}`}
    >
      <VerifiedIcon className={icon} /> Verified
    </span>
  );
}
