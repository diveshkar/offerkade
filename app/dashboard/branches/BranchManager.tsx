'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Alert, Button, Field, Input, Select, Textarea } from '@/app/components/ui';
import { PinIcon } from '@/app/components/Icons';
import { PROVINCES } from '@/lib/sri-lanka';
import { deleteBranch, makePrimary, saveBranch } from '@/app/dashboard/branches/actions';
import type { Branch } from '@/lib/database.types';

const blank = { id: '', label: '', district: '', city: '', address: '' };

export default function BranchManager({ branches }: { branches: Branch[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blank);

  const set = (k: keyof typeof blank, v: string) => setForm((f) => ({ ...f, [k]: v }));

  function edit(b: Branch) {
    setForm({
      id: b.id,
      label: b.label ?? '',
      district: b.district,
      city: b.city ?? '',
      address: b.address ?? '',
    });
    setError('');
    setOpen(true);
  }

  function run(action: (fd: FormData) => Promise<{ error?: string }>, fd: FormData) {
    setError('');
    startTransition(async () => {
      const result = await action(fd);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      setForm(blank);
      router.refresh();
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.district) {
      setError('Choose a district for this branch.');
      return;
    }
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.set(k, v));
    run(saveBranch, fd);
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <Alert tone="error">{error}</Alert>}

      <ul className="flex flex-col gap-3">
        {branches.map((b) => (
          <li
            key={b.id}
            className="flex items-start gap-3 rounded-2xl border border-coal/12 bg-paper-soft p-4"
          >
            <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-flame/12 text-flame-deep">
              <PinIcon className="h-4 w-4" />
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-coal-deep">
                  {b.label || b.city || b.district}
                </p>
                {b.is_primary && (
                  <span className="rounded-full bg-flame/12 px-2 py-0.5 text-[11px] font-semibold text-flame-deep">
                    Main
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-[13px] text-coal/50">{b.district} District</p>
              {b.address && (
                <p className="mt-1 text-[13px] leading-6 text-coal/65">{b.address}</p>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              {!b.is_primary && (
                <form
                  action={(fd) => {
                    fd.set('id', b.id);
                    run(makePrimary, fd);
                  }}
                >
                  <Button variant="secondary" size="sm" disabled={pending}>
                    Set main
                  </Button>
                </form>
              )}
              <Button variant="secondary" size="sm" onClick={() => edit(b)} disabled={pending}>
                Edit
              </Button>
              {branches.length > 1 && (
                <form
                  action={(fd) => {
                    fd.set('id', b.id);
                    run(deleteBranch, fd);
                  }}
                >
                  <Button variant="danger" size="sm" disabled={pending}>
                    Remove
                  </Button>
                </form>
              )}
            </div>
          </li>
        ))}
      </ul>

      {open ? (
        <form
          onSubmit={submit}
          className="flex flex-col gap-5 rounded-2xl border border-coal/12 bg-paper-soft p-5"
        >
          <p className="text-sm font-semibold text-coal-deep">
            {form.id ? 'Edit branch' : 'New branch'}
          </p>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="District" required>
              <Select value={form.district} onChange={(e) => set('district', e.target.value)}>
                <option value="">Choose a district</option>
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

            <Field label="City or town" hint="Optional">
              <Input
                value={form.city}
                onChange={(e) => set('city', e.target.value)}
                placeholder="Dehiwala"
              />
            </Field>
          </div>

          <Field label="Branch name" hint="Optional">
            <Input
              value={form.label}
              onChange={(e) => set('label', e.target.value)}
              placeholder="Nugegoda outlet"
            />
          </Field>

          <Field label="Address" hint="Optional">
            <Textarea
              value={form.address}
              onChange={(e) => set('address', e.target.value)}
              rows={2}
              placeholder="42 Galle Road, Dehiwala"
            />
          </Field>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setOpen(false);
                setForm(blank);
                setError('');
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Saving' : form.id ? 'Save branch' : 'Add branch'}
            </Button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => {
            setForm(blank);
            setError('');
            setOpen(true);
          }}
          className="rounded-xl border border-dashed border-coal/25 py-3 text-sm font-semibold text-coal/65 transition hover:border-flame hover:text-flame-deep"
        >
          Add a branch
        </button>
      )}
    </div>
  );
}
