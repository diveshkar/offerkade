'use client';

import { useState, useTransition } from 'react';
import { Alert, Button, Field, Input, Select, Textarea } from '@/app/components/ui';
import ConfirmButton from '@/app/components/ConfirmButton';
import { updateMyShop, deleteMyShop } from '@/app/dashboard/actions';
import { PROVINCES } from '@/lib/sri-lanka';
import type { Business } from '@/lib/database.types';

export default function ShopDetailsForm({
  business,
  saved,
}: {
  business: Business;
  saved?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const [name, setName] = useState(business.name ?? '');
  const [email, setEmail] = useState(business.contact_email ?? '');
  const [phone, setPhone] = useState(business.contact_phone ?? '');
  const [whatsapp, setWhatsapp] = useState(business.whatsapp ?? '');
  const [website, setWebsite] = useState(business.website ?? '');
  const [city, setCity] = useState(business.city ?? '');
  const [address, setAddress] = useState(business.address ?? '');

  function submit() {
    setError('');
    if (name.trim().length < 2) {
      setError('The shop needs a name.');
      return;
    }
    const data = new FormData();
    data.set('name', name.trim());
    data.set('contact_email', email.trim());
    data.set('contact_phone', phone.trim());
    data.set('whatsapp', whatsapp.trim());
    data.set('website', website.trim());
    data.set('city', city);
    data.set('address', address.trim());

    startTransition(async () => {
      const result = await updateMyShop(data);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <form onSubmit={(e) => e.preventDefault()} noValidate className="flex flex-col gap-5">
        {saved && <Alert tone="success">Your shop details were saved.</Alert>}
        {error && <Alert tone="error">{error}</Alert>}

        <Field label="Shop name" required>
          <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Contact email" hint="Optional">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Contact phone" hint="Optional">
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="WhatsApp" hint="Optional">
            <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
          </Field>
          <Field label="Website" hint="no need to type https://">
            <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="yourshop.lk" />
          </Field>
        </div>

        <Field label="District" hint="Optional">
          <Select value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="">No district</option>
            {PROVINCES.map((p) => (
              <optgroup key={p.province} label={`${p.province} Province`}>
                {p.districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </optgroup>
            ))}
          </Select>
        </Field>

        <Field label="Address" hint="Optional">
          <Textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} placeholder="42 Galle Road, Dehiwala" />
        </Field>

        <div className="flex justify-end border-t border-coal/10 pt-5">
          <Button type="button" onClick={submit} disabled={pending}>
            {pending ? 'Saving' : 'Save changes'}
          </Button>
        </div>
      </form>

      {/* Danger zone */}
      <div className="rounded-2xl border border-ember/25 bg-ember/[0.03] p-5">
        <h2 className="font-display text-lg font-semibold text-ember">Delete shop</h2>
        <p className="mt-1 text-sm leading-6 text-coal/60">
          Permanently deletes your shop and all of its offers. This cannot be undone.
        </p>
        <div className="mt-4">
          <ConfirmButton
            action={deleteMyShop}
            triggerLabel="Delete my shop"
            triggerClassName="inline-flex h-10 items-center justify-center rounded-xl border border-ember/30 bg-ember/5 px-5 text-sm font-semibold text-ember transition hover:bg-ember/10 active:scale-[0.98]"
            title="Delete your shop?"
            message="Your shop and every offer under it will be permanently removed. This cannot be undone."
            confirmLabel="Delete shop"
            tone="danger"
          />
        </div>
      </div>
    </div>
  );
}
