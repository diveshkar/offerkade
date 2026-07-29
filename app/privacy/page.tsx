import type { Metadata } from 'next';
import PageShell from '@/app/components/PageShell';

export const metadata: Metadata = {
  title: 'Privacy Policy · OfferCeylon',
  description: 'How OfferCeylon collects and uses personal data, under Sri Lanka&apos;s PDPA.',
};

export default function PrivacyPage() {
  return (
    <PageShell title="Privacy Policy">
      <p className="text-sm text-zinc-400">Last updated: {new Date().toLocaleDateString('en-GB')}</p>

      {/* Olyntox (Pvt) Ltd operator attribution hidden until the company is
          registered. Restore: "OfferCeylon, operated by Olyntox (Pvt) Ltd (\"we\", \"us\"),…" */}
      <p>
        OfferCeylon (&quot;we&quot;, &quot;us&quot;) respects your privacy. This policy explains what
        personal data we collect and how we use it, in line with Sri Lanka&apos;s{' '}
        <strong>Personal Data Protection Act No. 9 of 2022 (PDPA)</strong>.
      </p>

      <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">What we collect</h2>
      <p>
        When a business submits an offer, we collect the details provided on the form: business
        name, contact email, phone number, optional WhatsApp number, city, and the offer content and
        poster image. We do not require visitors to create an account to browse offers.
      </p>

      <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">How we use it</h2>
      <p>
        We use business contact details only to review, publish, and manage submitted offers, and to
        contact the submitter about their listing (for example, approval, rejection, or an
        expiry reminder). We do not sell your personal data.
      </p>

      <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Your rights</h2>
      <p>
        Under the PDPA you may request access to, correction of, or deletion of your personal data.
        To do so, email{' '}
        <a href="mailto:support@offerceylon.com" className="font-medium text-flame-deep dark:text-flame-bright hover:underline">
          support@offerceylon.com
        </a>
        .
      </p>

      <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Cookies</h2>
      <p>
        We only use the essential cookies needed to keep you signed in to a shop or admin account. We
        do not use analytics or third-party advertising trackers at this time.
      </p>

    </PageShell>
  );
}
