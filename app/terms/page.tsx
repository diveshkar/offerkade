import type { Metadata } from 'next';
import PageShell from '@/app/components/PageShell';

export const metadata: Metadata = {
  title: 'Terms · OfferCeylon',
  description: 'Terms of use for OfferCeylon.',
};

export default function TermsPage() {
  return (
    <PageShell title="Terms of Use">
      <p className="text-sm text-zinc-400">Last updated: {new Date().toLocaleDateString('en-GB')}</p>

      <p>
        By using OfferCeylon you agree to these terms. OfferCeylon is a free directory that lists
        offers submitted by businesses. We are not the seller and are not party to any transaction
        between you and a business.
      </p>

      <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Offer accuracy</h2>
      <p>
        Offers are provided by businesses and may change or end without notice. Always confirm the
        details and validity directly with the business before relying on an offer. We are not liable
        for offers that are unavailable, incorrect, or withdrawn.
      </p>

      <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Content &amp; takedown</h2>
      <p>
        Businesses are responsible for the content and images they submit and confirm they have the
        right to share them. If you believe an offer or image infringes your rights, email{' '}
        <a href="mailto:hello@offerceylon.lk" className="font-medium text-gold-deep dark:text-gold-bright hover:underline">
          hello@offerceylon.lk
        </a>{' '}
        with the offer link and we will review and remove it promptly.
      </p>

      <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Acceptable use</h2>
      <p>
        Do not submit false, misleading, offensive, or unlawful content, and do not attempt to
        disrupt or abuse the service.
      </p>

      <p className="text-sm text-zinc-400">
        These terms are a starting point and should be reviewed before public launch.
      </p>
    </PageShell>
  );
}
