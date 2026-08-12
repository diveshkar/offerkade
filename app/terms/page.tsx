import type { Metadata } from 'next';
import PageShell from '@/app/components/PageShell';

export const metadata: Metadata = {
  title: 'Terms · OfferCeylon',
  description: 'Terms of use for OfferCeylon.',
};

const SECTIONS = [
  { id: 'offer-accuracy', label: 'Offer accuracy' },
  { id: 'content-takedown', label: 'Content & takedown' },
  { id: 'acceptable-use', label: 'Acceptable use' },
];

export default function TermsPage() {
  return (
    <PageShell title="Terms of Use">
      <span className="!mb-1 inline-flex w-fit items-center rounded-full bg-coal/5 px-3 py-1 text-xs font-medium text-coal/55 dark:bg-white/10 dark:text-paper/55">
        Last updated {new Date().toLocaleDateString('en-GB')}
      </span>

      {/* Olyntox (Pvt) Ltd operator attribution hidden until the company is
          registered. Restore: "OfferCeylon is operated by Olyntox (Pvt) Ltd and is a…" */}
      <p>
        By using OfferCeylon you agree to these terms. OfferCeylon is a free directory that lists
        offers submitted by businesses. We are not the seller and are not party to any transaction
        between you and a business.
      </p>

      <nav className="!mt-2 rounded-2xl border border-coal/10 bg-paper-soft p-4 dark:border-white/10 dark:bg-coal-soft">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-coal/40 dark:text-paper/40">
          On this page
        </p>
        <ul className="flex flex-col gap-1.5">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="text-sm font-medium text-flame-deep hover:underline dark:text-flame-bright"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <h2 id="offer-accuracy" className="scroll-mt-24 text-xl font-bold text-coal-deep dark:text-paper">
        Offer accuracy
      </h2>
      <p>
        Offers are provided by businesses and may change or end without notice. Always confirm the
        details and validity directly with the business before relying on an offer. We are not liable
        for offers that are unavailable, incorrect, or withdrawn.
      </p>

      <h2 id="content-takedown" className="scroll-mt-24 text-xl font-bold text-coal-deep dark:text-paper">
        Content &amp; takedown
      </h2>
      <p>
        Businesses are responsible for the content and images they submit and confirm they have the
        right to share them. If you believe an offer or image infringes your rights, email{' '}
        <a href="mailto:support@offerceylon.com" className="font-medium text-flame-deep dark:text-flame-bright hover:underline">
          support@offerceylon.com
        </a>{' '}
        with the offer link and we will review and remove it promptly.
      </p>

      <h2 id="acceptable-use" className="scroll-mt-24 text-xl font-bold text-coal-deep dark:text-paper">
        Acceptable use
      </h2>
      <p>
        Do not submit false, misleading, offensive, or unlawful content, and do not attempt to
        disrupt or abuse the service.
      </p>
    </PageShell>
  );
}
