'use client';

import { useState, useTransition } from 'react';
import { Alert, Button, Field, Input } from '@/app/components/ui';
import BranchFields, { emptyBranch, type Branch } from '@/app/onboarding/BranchFields';
import { completeOnboarding } from '@/app/onboarding/actions';
import { PHONE_HELP, isValidPhone } from '@/lib/phone';

type Errors = Record<string, string>;

export default function OnboardingForm() {
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState('');
  const [errors, setErrors] = useState<Errors>({});

  const [multi, setMulti] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [website, setWebsite] = useState('');
  const [branches, setBranches] = useState<Branch[]>([emptyBranch()]);

  const visible = multi ? branches : branches.slice(0, 1);

  function validate(): Errors {
    const next: Errors = {};

    if (name.trim().length < 2) next.name = 'Enter your shop name.';
    if (!phone.trim()) next.phone = 'Enter a contact number.';
    else if (!isValidPhone(phone)) next.phone = 'Enter a valid Sri Lankan number.';
    if (whatsapp.trim() && !isValidPhone(whatsapp))
      next.whatsapp = 'Enter a valid Sri Lankan number.';
    if (website.trim() && !/^https?:\/\/\S+\.\S+/.test(website.trim()))
      next.website = 'Include the full address, starting with https://';

    visible.forEach((b, i) => {
      if (!b.district) next[`branch-${i}`] = 'Choose a district.';
    });

    return next;
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setFormError('Check the highlighted fields and try again.');
      return;
    }

    const data = new FormData();
    data.set('name', name);
    data.set('phone', phone);
    data.set('whatsapp', whatsapp);
    data.set('website', website);
    data.set(
      'branches',
      JSON.stringify(
        visible.map(({ label, district, city, address, lat, lng }) => ({
          label,
          district,
          city,
          address,
          lat,
          lng,
        })),
      ),
    );

    startTransition(async () => {
      const result = await completeOnboarding(data);
      if (result?.error) setFormError(result.error);
    });
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-9">
      {formError && <Alert tone="error">{formError}</Alert>}

      <section className="flex flex-col gap-5">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight text-coal-deep">
            About your shop
          </h2>
          <p className="mt-1 text-sm text-coal/60">
            This is what shoppers see next to every offer.
          </p>
        </div>

        <Field label="Shop name" required error={errors.name}>
          <Input
            value={name}
            invalid={Boolean(errors.name)}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ceylon Spice Kitchen"
            maxLength={80}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Phone" hint={PHONE_HELP} required error={errors.phone}>
            <Input
              value={phone}
              invalid={Boolean(errors.phone)}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="tel"
              placeholder="077 123 4567"
            />
          </Field>

          <Field label="WhatsApp" hint="Optional" error={errors.whatsapp}>
            <Input
              value={whatsapp}
              invalid={Boolean(errors.whatsapp)}
              onChange={(e) => setWhatsapp(e.target.value)}
              inputMode="tel"
              placeholder="077 123 4567"
            />
          </Field>
        </div>

        <Field label="Website" hint="Optional" error={errors.website}>
          <Input
            value={website}
            invalid={Boolean(errors.website)}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://yourshop.lk"
          />
        </Field>
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight text-coal-deep">
            Where you trade
          </h2>
          <p className="mt-1 text-sm text-coal/60">Shoppers filter offers by district.</p>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-xl border border-coal/12 bg-paper p-1">
          <button
            type="button"
            onClick={() => setMulti(false)}
            aria-pressed={!multi}
            className={`h-10 rounded-lg text-sm font-semibold transition ${
              !multi ? 'bg-flame text-coal-deep' : 'text-coal/60 hover:text-coal-deep'
            }`}
          >
            One location
          </button>
          <button
            type="button"
            onClick={() => setMulti(true)}
            aria-pressed={multi}
            className={`h-10 rounded-lg text-sm font-semibold transition ${
              multi ? 'bg-flame text-coal-deep' : 'text-coal/60 hover:text-coal-deep'
            }`}
          >
            Multiple branches
          </button>
        </div>

        {visible.map((branch, i) => (
          <BranchFields
            key={branch.key}
            branch={branch}
            index={i}
            single={!multi}
            error={errors[`branch-${i}`]}
            onChange={(next) =>
              setBranches((list) => list.map((b) => (b.key === branch.key ? next : b)))
            }
            onRemove={
              multi && visible.length > 1
                ? () => setBranches((list) => list.filter((b) => b.key !== branch.key))
                : undefined
            }
          />
        ))}

        {multi && (
          <button
            type="button"
            onClick={() => setBranches((list) => [...list, emptyBranch()])}
            className="rounded-xl border border-dashed border-coal/25 py-3 text-sm font-semibold text-coal/65 transition hover:border-flame hover:text-flame-deep"
          >
            Add another branch
          </button>
        )}
      </section>

      <div className="flex flex-col gap-3 border-t border-coal/10 pt-6">
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving your shop' : 'Finish setup'}
        </Button>
        <p className="text-center text-xs leading-5 text-coal/50">
          We review every shop before its offers go live. This usually takes a day.
        </p>
      </div>
    </form>
  );
}
