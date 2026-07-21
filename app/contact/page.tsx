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
        <a href="mailto:support@offerceylon.lk" className="font-medium text-flame-deep dark:text-flame-bright hover:underline">
          support@offerceylon.lk
        </a>
      </p>
      <p>
        If you&apos;re a business and would like an offer removed, email us with the offer link and
        we&apos;ll take it down promptly. See our takedown note in the{' '}
        <a href="/terms" className="font-medium text-flame-deep dark:text-flame-bright hover:underline">
          Terms
        </a>
        .
      </p>
    </PageShell>
  );
}
