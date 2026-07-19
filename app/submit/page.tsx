import type { Metadata } from 'next';
import PageShell from '@/app/components/PageShell';

export const metadata: Metadata = {
  title: 'List your offer free · OfferCeylon',
  description: 'Businesses can list their current offer on OfferCeylon for free.',
};

// Placeholder. The real shop dashboard arrives in Phase 5.
export default function SubmitPage() {
  return (
    <PageShell title="List your offer, free">
      <p>
        Got a current deal? We&apos;ll list it on OfferCeylon so people across Sri Lanka can find it,
        completely free.
      </p>
      <p>
        Our self-serve submission form is coming very soon. In the meantime, send us your poster and
        offer details and we&apos;ll get you listed:
      </p>
      <p>
        <a
          href="mailto:hello@offerceylon.lk?subject=New%20offer%20listing"
          className="inline-block rounded-full bg-gradient-to-b from-flame-bright to-flame px-6 py-3 font-semibold text-coal-deep shadow-lg shadow-flame/25 transition hover:brightness-105 active:scale-[0.98]"
        >
          Email your offer →
        </a>
      </p>
    </PageShell>
  );
}
