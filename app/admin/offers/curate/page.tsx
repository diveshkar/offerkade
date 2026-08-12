import type { Metadata } from 'next';
import Link from 'next/link';
import CurateForm from '@/app/admin/offers/curate/CurateForm';
import { getCategoriesForForm } from '@/lib/queries/shop';

export const metadata: Metadata = { title: 'Post an offer as OfferCeylon · Admin' };
export const dynamic = 'force-dynamic';

export default async function CuratePage() {
  const categories = await getCategoriesForForm();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/offers" className="text-sm text-coal/50 hover:text-flame-deep">
          ← Back to offers
        </Link>
        <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-coal-deep">
          Post an offer as OfferCeylon
        </h1>
        <p className="mt-1 max-w-2xl text-[15px] text-coal/60">
          Manually add an offer you found somewhere, no shop registration needed. It&apos;s posted
          under the OfferCeylon account, with the venue name shown to visitors.
        </p>
      </div>

      <CurateForm categories={categories} />
    </div>
  );
}
