import type { Metadata } from 'next';
import PageShell from '@/app/components/PageShell';

export const metadata: Metadata = {
  title: 'Privacy Policy · OfferCeylon',
  description: 'How OfferCeylon collects and uses personal data, under Sri Lanka&apos;s PDPA.',
};

export default function PrivacyPage() {
  // Keeps this section truthful automatically: the analytics disclosure only
  // shows once Google Analytics is actually switched on (its ID is set).
  const usesAnalytics = Boolean(process.env.NEXT_PUBLIC_GA_ID);

  const sections = [
    { id: 'what-we-collect', label: 'What we collect' },
    { id: 'how-we-use-it', label: 'How we use it' },
    { id: 'your-rights', label: 'Your rights' },
    { id: 'cookies', label: usesAnalytics ? 'Cookies & analytics' : 'Cookies' },
  ];

  return (
    <PageShell title="Privacy Policy">
      <span className="!mb-1 inline-flex w-fit items-center rounded-full bg-coal/5 px-3 py-1 text-xs font-medium text-coal/55 dark:bg-white/10 dark:text-paper/55">
        Last updated {new Date().toLocaleDateString('en-GB')}
      </span>

      {/* Olyntox (Pvt) Ltd operator attribution hidden until the company is
          registered. Restore: "OfferCeylon, operated by Olyntox (Pvt) Ltd (\"we\", \"us\"),…" */}
      <p>
        OfferCeylon (&quot;we&quot;, &quot;us&quot;) respects your privacy. This policy explains what
        personal data we collect and how we use it, in line with Sri Lanka&apos;s{' '}
        <strong>Personal Data Protection Act No. 9 of 2022 (PDPA)</strong>.
      </p>

      {/* Table of contents: a legal page with several sections is easier to
          scan when you can jump straight to the part you need. */}
      <nav className="!mt-2 rounded-2xl border border-coal/10 bg-paper-soft p-4 dark:border-white/10 dark:bg-coal-soft">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-coal/40 dark:text-paper/40">
          On this page
        </p>
        <ul className="flex flex-col gap-1.5">
          {sections.map((s) => (
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

      <h2 id="what-we-collect" className="scroll-mt-24 text-xl font-bold text-coal-deep dark:text-paper">
        What we collect
      </h2>
      <p>
        When a business submits an offer, we collect the details provided on the form: business
        name, contact email, phone number, optional WhatsApp number, city, and the offer content and
        poster image. We do not require visitors to create an account to browse offers.
      </p>

      <h2 id="how-we-use-it" className="scroll-mt-24 text-xl font-bold text-coal-deep dark:text-paper">
        How we use it
      </h2>
      <p>
        We use business contact details only to review, publish, and manage submitted offers, and to
        contact the submitter about their listing (for example, approval, rejection, or an
        expiry reminder). We do not sell your personal data.
      </p>

      <h2 id="your-rights" className="scroll-mt-24 text-xl font-bold text-coal-deep dark:text-paper">
        Your rights
      </h2>
      <p>
        Under the PDPA you may request access to, correction of, or deletion of your personal data.
        To do so, email{' '}
        <a href="mailto:support@offerceylon.com" className="font-medium text-flame-deep dark:text-flame-bright hover:underline">
          support@offerceylon.com
        </a>
        .
      </p>

      <h2 id="cookies" className="scroll-mt-24 text-xl font-bold text-coal-deep dark:text-paper">
        Cookies{usesAnalytics ? ' & analytics' : ''}
      </h2>
      {usesAnalytics ? (
        <p>
          We use essential cookies to keep you signed in, and{' '}
          <strong>Google Analytics</strong> (which sets its own cookies) to understand traffic, such
          as which offers are popular and the countries visitors come from. This helps us improve the
          service and plan advertising. We do not sell your personal data. You can block cookies in
          your browser settings.
        </p>
      ) : (
        <p>
          We only use the essential cookies needed to keep you signed in to a shop or admin account.
          We do not use analytics or third-party advertising trackers at this time.
        </p>
      )}
    </PageShell>
  );
}
