import type { Metadata } from 'next';
import PageShell from '@/app/components/PageShell';

export const metadata: Metadata = {
  title: 'List your offer free · OfferCeylon',
  description: 'Businesses can list their current offer on OfferCeylon for free.',
};

// Placeholder — the real submission form (Edge Function + Turnstile) arrives in Phase 5.
export default function SubmitPage() {
  return (
    <PageShell title="List your offer — free">
      <p>
        Got a current deal? We&apos;ll list it on OfferCeylon so people across Sri Lanka can find it —
        completely free.
      </p>
      <p>
        Our self-serve submission form is coming very soon. In the meantime, send us your poster and
        offer details and we&apos;ll get you listed:
      </p>
      <p>
        <a
          href="mailto:hello@offerceylon.lk?subject=New%20offer%20listing"
          className="inline-block rounded-lg bg-amber-500 px-5 py-2.5 font-semibold text-[#10182b] hover:bg-amber-400"
        >
          Email your offer →
        </a>
      </p>
    </PageShell>
  );
}
