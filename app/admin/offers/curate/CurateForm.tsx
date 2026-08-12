'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Button, Field, Input, Select, Textarea } from '@/app/components/ui';
import { ACCEPT_ATTR, compressPoster, formatBytes, validateImageFile } from '@/lib/image/compress';
import { postCuratedOffer } from '@/app/admin/actions';
import { PROVINCES } from '@/lib/sri-lanka';
import type { Category } from '@/lib/database.types';

const today = new Date().toISOString().slice(0, 10);

export default function CurateForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setError(null);
    if (!f) {
      setFile(null);
      setPreview(null);
      return;
    }
    const check = validateImageFile(f);
    if (!check.ok) {
      setError(check.error ?? 'Invalid image.');
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const fd = new FormData(formRef.current!);
      if (file) {
        const { poster, thumb } = await compressPoster(file);
        fd.set('poster', poster);
        fd.set('thumb', thumb);
      }
      const result = await postCuratedOffer(fd);
      if (result?.error) {
        setError(result.error);
        setBusy(false);
      } else {
        router.push('/admin/offers');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setBusy(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="flex max-w-2xl flex-col gap-5">
      <Field label="Offer title" required>
        <Input name="title" placeholder="e.g. 20% Off Dinner Buffet" minLength={5} required />
      </Field>

      <Field label="Shop / venue name" required hint="The business this offer is for">
        <Input name="source_name" placeholder="e.g. Trinco Blu by Cinnamon" required />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Category" required>
          <Select name="category_id" defaultValue="" required>
            <option value="" disabled>
              Select…
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="District" required>
          <Select name="city" defaultValue="" required>
            <option value="" disabled>
              Select…
            </option>
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
      </div>

      <Field label="Location / area" hint="Optional, e.g. Uppuveli, Trincomalee">
        <Input name="location_note" placeholder="Area or branch" />
      </Field>

      <Field label="Description" hint="What's the deal, and any conditions?">
        <Textarea name="description" rows={3} placeholder="Describe the offer" />
      </Field>

      <label className="flex items-start gap-3 rounded-xl border border-coal/15 bg-paper p-3.5 dark:border-white/10 dark:bg-coal-deep/40">
        <input
          type="checkbox"
          name="tourist_friendly"
          value="true"
          className="mt-0.5 h-4 w-4 accent-flame"
        />
        <span className="text-sm">
          <span className="font-medium text-coal-deep dark:text-paper">
            Aimed at tourists / foreign visitors
          </span>
          <span className="mt-0.5 block text-[13px] text-coal/55 dark:text-paper/55">
            Tick for hotels, restaurants, tours, attractions and travel services likely to attract
            foreign visitors.
          </span>
        </span>
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Starts">
          <Input name="start_date" type="date" defaultValue={today} min={today} />
        </Field>
        <Field label="Ends" required>
          <Input name="end_date" type="date" min={today} required />
        </Field>
      </div>

      {/* Poster */}
      <div className="flex flex-col gap-2 text-sm">
        <span className="font-medium text-coal-deep">Poster image (optional)</span>
        <div className="flex items-center gap-4">
          <label className="cursor-pointer rounded-full border border-coal/20 px-4 py-2 font-medium transition hover:border-flame dark:border-white/15">
            Choose image
            <input type="file" accept={ACCEPT_ATTR} onChange={onPick} className="hidden" />
          </label>
          {file && (
            <span className="text-coal/60 dark:text-paper/60">
              {file.name} ({formatBytes(file.size)})
            </span>
          )}
        </div>
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="preview" className="mt-1 h-40 w-32 rounded-xl object-cover" />
        )}
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      <div className="flex justify-end border-t border-coal/10 pt-5">
        <Button type="submit" disabled={busy}>
          {busy ? 'Posting…' : 'Post as OfferCeylon'}
        </Button>
      </div>
    </form>
  );
}
