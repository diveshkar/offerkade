import type { Metadata } from 'next';
import Link from 'next/link';
import PageShell from '@/app/components/PageShell';

export const metadata: Metadata = {
  title: 'About · OfferCeylon',
  description: "OfferCeylon lists current deals and offers from businesses across Sri Lanka, free to browse.",
};

export default function AboutPage() {
  return (
    <PageShell title="About OfferCeylon">
      <p>
        <strong>OfferCeylon</strong> is Sri Lanka&apos;s offers in one place: a free directory of
        current deals from restaurants, shops, furniture stores, cafés and more, right across the
        island.
      </p>
      <p>
        Businesses post their current offer as a poster. You browse them free by category and city.
        Offers automatically come down the moment they expire, so what you see is always current.
      </p>
      <p>
        Are you a business with a current offer?{' '}
        <Link href="/submit" className="font-medium text-gold-deep hover:underline dark:text-gold-bright">
          List it free →
        </Link>
      </p>
    </PageShell>
  );
}
