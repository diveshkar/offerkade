import type { Metadata } from 'next';
import PageShell from '@/app/components/PageShell';
import { ButtonLink } from '@/app/components/ui';
import { CheckIcon } from '@/app/components/Icons';

export const metadata: Metadata = {
  title: 'About · OfferCeylon',
  description: "OfferCeylon lists current deals and offers from businesses across Sri Lanka, free to browse.",
};

const POINTS = [
  'Every offer is posted by the business itself, not scraped or reposted',
  'Offers come down automatically the moment they expire',
  'Free to browse, and free for businesses to list',
];

export default function AboutPage() {
  return (
    <PageShell title="About OfferCeylon">
      <p>
        <strong>OfferCeylon</strong> is Sri Lanka&apos;s offers in one place: a free directory of
        current deals from restaurants, shops, furniture stores, cafes and more, right across the
        island.
      </p>
      <p>
        Businesses post their current offer as a poster. You browse them free by category and city.
      </p>

      <ul className="!mt-2 flex flex-col gap-3">
        {POINTS.map((point) => (
          <li key={point} className="flex items-start gap-3">
            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-flame/12 text-flame-deep dark:bg-flame/15">
              <CheckIcon className="h-3 w-3" />
            </span>
            <span>{point}</span>
          </li>
        ))}
      </ul>

      {/* Olyntox (Pvt) Ltd attribution hidden until the company is registered. Restore:
      <p>
        OfferCeylon is owned and operated by <strong>Olyntox (Pvt) Ltd</strong>, a Sri Lankan
        company.
      </p>
      */}

      <div className="!mt-8 rounded-2xl border border-coal/10 bg-paper-soft p-5 shadow-[0_1px_2px_rgba(18,13,10,0.04)] dark:border-white/10 dark:bg-coal-soft sm:p-6">
        <p className="font-display text-lg font-semibold text-coal-deep dark:text-paper">
          Have a shop with a current offer?
        </p>
        <p className="mt-1 text-sm leading-6 text-coal/60 dark:text-paper/60">
          List it free and it goes live on OfferCeylon as soon as we approve your shop.
        </p>
        <div className="mt-4">
          <ButtonLink href="/register">List it free</ButtonLink>
        </div>
      </div>
    </PageShell>
  );
}
