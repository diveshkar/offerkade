import type { Metadata } from 'next';
import PageShell from '@/app/components/PageShell';

export const metadata: Metadata = {
  title: 'Contact · OfferCeylon',
  description: 'Get in touch with OfferCeylon.',
};

export default function ContactPage() {
  return (
    <PageShell title="Contact us">
      <p>
        Questions, corrections, or want your offer listed? We&apos;d love to hear from you.
      </p>
      <p>
        Email:{' '}
        <a href="mailto:support@offerceylon.com" className="font-medium text-flame-deep dark:text-flame-bright hover:underline">
          support@offerceylon.com
        </a>
      </p>
      <p>
        Shops can remove their own offers anytime from the dashboard. To report a problem with an
        offer or request a takedown of content you own, email us the offer link and we&apos;ll review
        it promptly. See our takedown note in the{' '}
        <a href="/terms" className="font-medium text-flame-deep dark:text-flame-bright hover:underline">
          Terms
        </a>
        .
      </p>
    </PageShell>
  );
}
