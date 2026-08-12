import type { Metadata } from 'next';
import PageShell from '@/app/components/PageShell';
import { ButtonLink } from '@/app/components/ui';

export const metadata: Metadata = {
  title: 'Contact · OfferCeylon',
  description: 'Get in touch with OfferCeylon.',
};

export default function ContactPage() {
  return (
    <PageShell title="Contact us">
      <p>Questions, corrections, or want your offer listed? We&apos;d love to hear from you.</p>

      <div className="!mt-2 rounded-2xl border border-coal/10 bg-paper-soft p-5 shadow-[0_1px_2px_rgba(18,13,10,0.04)] dark:border-white/10 dark:bg-coal-soft sm:p-6">
        <p className="font-display text-lg font-semibold text-coal-deep dark:text-paper">
          Email us directly
        </p>
        <p className="mt-1 text-sm leading-6 text-coal/60 dark:text-paper/60">
          support@offerceylon.com
        </p>
        <div className="mt-4">
          <ButtonLink href="mailto:support@offerceylon.com" variant="secondary">
            Send an email
          </ButtonLink>
        </div>
      </div>

      <div className="!mt-4 rounded-2xl border border-coal/10 bg-paper-soft p-5 dark:border-white/10 dark:bg-coal-soft sm:p-6">
        <p className="font-semibold text-coal-deep dark:text-paper">Reporting an offer</p>
        <p className="mt-1 text-sm leading-6 text-coal/60 dark:text-paper/60">
          Shops can remove their own offers anytime from the dashboard. To report a problem with
          an offer, or request a takedown of content you own, email us the offer link and
          we&apos;ll review it promptly. See our takedown note in the{' '}
          <a
            href="/terms"
            className="font-medium text-flame-deep hover:underline dark:text-flame-bright"
          >
            Terms
          </a>
          .
        </p>
      </div>
    </PageShell>
  );
}
