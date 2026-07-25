'use client';

import { useState, useTransition } from 'react';
import { Alert, Button, ButtonLink, Field, Input, Select, Textarea } from '@/app/components/ui';
import { saveBusiness } from '@/app/admin/actions';
import { PROVINCES } from '@/lib/sri-lanka';
import type { Business } from '@/lib/database.types';

export default function BusinessEditForm({ business }: { business: Business }) {
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
    data.set('id', business.id);
    data.set('name', name.trim());
    data.set('contact_email', email.trim());
    data.set('contact_phone', phone.trim());
    data.set('whatsapp', whatsapp.trim());
    data.set('website', website.trim());
    data.set('city', city);
    data.set('address', address.trim());

    startTransition(async () => {
      const result = await saveBusiness(data);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form onSubmit={(e) => e.preventDefault()} noValidate className="flex max-w-2xl flex-col gap-5">
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
        <Field label="Website" hint="Optional">
          <Input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="example.lk"
          />
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
        <Textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          rows={2}
          placeholder="42 Galle Road, Dehiwala"
        />
      </Field>

      <div className="flex flex-col-reverse gap-3 border-t border-coal/10 pt-5 sm:flex-row sm:justify-end">
        <ButtonLink href="/admin/shops" variant="secondary">
          Cancel
        </ButtonLink>
        <Button type="button" onClick={submit} disabled={pending}>
          {pending ? 'Saving' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
