'use client';

import { useRef, useState, useTransition } from 'react';
import { Alert, Button, ButtonLink, Field, Input, Select, Textarea } from '@/app/components/ui';
import { ACCEPT_ATTR, compressPoster, formatBytes, validateImageFile } from '@/lib/image/compress';
import { saveAdminOffer } from '@/app/admin/actions';
import { PROVINCES } from '@/lib/sri-lanka';
import type { Branch, Category, Offer } from '@/lib/database.types';
import type { ShopForOffer } from '@/lib/queries/admin';

interface Prepared {
  poster: File;
  thumb: File;
  preview: string;
  originalSize: number;
}

type Errors = Record<string, string>;

function branchName(b: Branch) {
  return b.label || [b.city, b.district].filter(Boolean).join(', ') || b.district;
}

export default function AdminOfferForm({
  categories,
  businesses = [],
  offer = null,
  shopName,
  branches = [],
  initialBranchIds,
}: {
  categories: Category[];
  businesses?: ShopForOffer[];
  offer?: Offer | null;
  shopName?: string;
  branches?: Branch[];
  initialBranchIds?: string[];
}) {
  const today = new Date().toISOString().slice(0, 10);
  const editing = Boolean(offer);

  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState('');
  const [errors, setErrors] = useState<Errors>({});

  const [businessId, setBusinessId] = useState('');
  const [title, setTitle] = useState(offer?.title ?? '');
  const [categoryId, setCategoryId] = useState(offer?.category_id ? String(offer.category_id) : '');
  const [description, setDescription] = useState(offer?.description ?? '');
  const [city, setCity] = useState(offer?.city ?? '');
  const [startDate, setStartDate] = useState(offer?.start_date ?? today);
  const [endDate, setEndDate] = useState(offer?.end_date ?? '');
  const [featured, setFeatured] = useState(offer?.is_featured ?? false);
  const [picked, setPicked] = useState<string[]>(
    editing
      ? initialBranchIds && initialBranchIds.length > 0
        ? initialBranchIds
        : branches.map((b) => b.id)
      : [],
  );

  const [image, setImage] = useState<Prepared | null>(null);
  const existingPoster = offer?.poster_url ?? null;
  const previewImage = image?.preview ?? existingPoster;
  const hasPoster = Boolean(image) || Boolean(existingPoster);
  const [working, setWorking] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Which shop's branches are in play right now.
  const shopBranches = editing
    ? branches
    : (businesses.find((b) => b.id === businessId)?.branches ?? []);
  const multiBranch = shopBranches.length > 1;
  const singleBranch = shopBranches.length === 1;
  const shopChosen = editing || Boolean(businessId);
  const noBranches = shopChosen && shopBranches.length === 0;

  function onBusinessChange(id: string) {
    setBusinessId(id);
    const biz = businesses.find((b) => b.id === id);
    setPicked((biz?.branches ?? []).map((b) => b.id));
    setCity('');
    setErrors((p) => ({ ...p, business: '', branches: '', city: '' }));
  }

  function toggleBranch(id: string) {
    setPicked((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));
  }

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrors((p) => ({ ...p, poster: '' }));
    const check = validateImageFile(file);
    if (!check.ok) {
      setErrors((p) => ({ ...p, poster: check.error ?? 'That image cannot be used.' }));
      return;
    }

    setWorking(true);
    try {
      const { poster, thumb } = await compressPoster(file);
      setImage({ poster, thumb, preview: URL.createObjectURL(poster), originalSize: file.size });
    } catch {
      setErrors((p) => ({ ...p, poster: 'That image could not be processed. Try another file.' }));
    } finally {
      setWorking(false);
    }
  }

  function validate(): Errors {
    const next: Errors = {};
    if (!editing && !businessId) next.business = 'Choose the shop this offer belongs to.';
    if (title.trim().length < 5) next.title = 'Give the offer a clear title, at least 5 characters.';
    if (!categoryId) next.category = 'Choose a category.';
    if (multiBranch && picked.length === 0) next.branches = 'Choose at least one branch.';
    if (noBranches && !city) next.city = 'Choose a district.';
    if (!endDate) next.endDate = 'Choose the day this offer ends.';
    else if (endDate < today) next.endDate = 'The end date cannot be in the past.';
    else if (startDate && endDate < startDate) {
      next.endDate = 'The end date must be on or after the start date.';
    }
    if (startDate && startDate < today) next.startDate = 'The start date cannot be in the past.';
    if (!hasPoster) next.poster = 'Add a poster image.';
    return next;
  }

  function submit() {
    setFormError('');
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setFormError('Check the highlighted fields and try again.');
      return;
    }

    const data = new FormData();
    if (offer) data.set('offer_id', offer.id);
    if (!editing) data.set('business_id', businessId);
    data.set('title', title.trim());
    data.set('category_id', categoryId);
    data.set('description', description.trim());
    data.set('city', city); // used server-side only when the shop has no branches
    data.set('branch_ids', JSON.stringify(multiBranch || singleBranch ? picked : []));
    data.set('start_date', startDate);
    data.set('end_date', endDate);
    data.set('is_featured', String(featured));
    if (image) {
      data.set('poster', image.poster);
      data.set('thumb', image.thumb);
    }

    startTransition(async () => {
      const result = await saveAdminOffer(data);
      if (result?.error) setFormError(result.error);
    });
  }

  return (
    <form onSubmit={(e) => e.preventDefault()} noValidate className="flex max-w-2xl flex-col gap-5">
      {formError && <Alert tone="error">{formError}</Alert>}

      {editing ? (
        <div className="rounded-xl border border-coal/12 bg-paper-soft px-4 py-3 text-sm text-coal/70">
          Editing an offer for{' '}
          <span className="font-semibold text-coal-deep">{shopName ?? 'this shop'}</span>.
        </div>
      ) : (
        <Field label="Shop" required error={errors.business}>
          <Select
            value={businessId}
            invalid={Boolean(errors.business)}
            onChange={(e) => onBusinessChange(e.target.value)}
          >
            <option value="">Choose a shop</option>
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>
        </Field>
      )}

      <Field label="Offer title" required error={errors.title}>
        <Input
          value={title}
          invalid={Boolean(errors.title)}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Buy 1 Get 1 Free: Large Pizzas"
          maxLength={90}
        />
      </Field>

      <Field label="Category" required error={errors.category}>
        <Select
          value={categoryId}
          invalid={Boolean(errors.category)}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">Choose a category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </Field>

      {/* Location: driven by the shop's branches, exactly like the shop's own
          offer form. One branch is used automatically; several show a picker;
          a shop with no branches on record falls back to a district select. */}
      {!shopChosen ? (
        <p className="text-[13px] text-coal/50">Choose a shop to set the offer location.</p>
      ) : multiBranch ? (
        <div>
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <span className="text-sm font-medium text-coal-deep">
              Branches<span className="ml-0.5 text-coal/40" aria-hidden>*</span>
            </span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() =>
                setPicked(
                  picked.length === shopBranches.length ? [] : shopBranches.map((b) => b.id),
                )
              }
              className="h-7 px-3 text-xs"
            >
              {picked.length === shopBranches.length ? 'Clear all' : 'Select all'}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {shopBranches.map((b) => {
              const on = picked.includes(b.id);
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => toggleBranch(b.id)}
                  aria-pressed={on}
                  className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition ${
                    on
                      ? 'border-flame bg-flame text-coal-deep'
                      : 'border-coal/15 bg-paper-soft text-coal/65 hover:border-flame/60 hover:text-coal-deep'
                  }`}
                >
                  {branchName(b)}
                </button>
              );
            })}
          </div>
          {errors.branches && <p className="mt-1.5 text-[13px] text-ember">{errors.branches}</p>}
        </div>
      ) : singleBranch ? (
        <div>
          <span className="mb-1.5 block text-sm font-medium text-coal-deep">Location</span>
          <div className="rounded-xl border border-coal/12 bg-paper-soft px-3.5 py-2.5 text-sm text-coal/75">
            {branchName(shopBranches[0])}
            <span className="text-coal/45"> ({shopBranches[0].district} District)</span>
          </div>
        </div>
      ) : (
        <Field label="District" required error={errors.city}>
          <Select value={city} invalid={Boolean(errors.city)} onChange={(e) => setCity(e.target.value)}>
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
      )}

      <div className="grid gap-4">
        <Field label="Starts" error={errors.startDate}>
          <Input
            type="date"
            value={startDate}
            min={today}
            invalid={Boolean(errors.startDate)}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </Field>

        <Field label="Ends" required error={errors.endDate}>
          <Input
            type="date"
            value={endDate}
            min={startDate || today}
            invalid={Boolean(errors.endDate)}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </Field>
      </div>

      <Field label="Description" hint="Optional">
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          maxLength={600}
          placeholder="What is included, and any conditions customers should know."
        />
      </Field>

      <div>
        <div className="mb-1.5 flex items-baseline justify-between gap-3">
          <span className="text-sm font-medium text-coal-deep">
            Poster<span className="ml-0.5 text-coal/40" aria-hidden>*</span>
          </span>
          <span className="text-xs text-coal/45">JPG, PNG or WebP, up to 10MB</span>
        </div>

        <div
          className={`rounded-xl border border-dashed bg-paper p-4 ${
            errors.poster ? 'border-ember/60' : 'border-coal/25'
          }`}
        >
          {previewImage ? (
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewImage} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-coal-deep">
                  {image ? 'Ready to save' : 'Current poster'}
                </p>
                {image ? (
                  <p className="mt-0.5 text-[13px] text-coal/55">
                    {formatBytes(image.originalSize)} compressed to {formatBytes(image.poster.size)}
                  </p>
                ) : (
                  <p className="mt-0.5 text-[13px] text-coal/55">Keep it, or replace with a new image.</p>
                )}
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileRef.current?.click()}
                className="h-8 shrink-0 px-3 text-[13px]"
              >
                Replace
              </Button>
            </div>
          ) : (
            <div className="py-6 text-center">
              <p className="text-sm text-coal/60">
                {working ? 'Compressing the image' : 'Add the poster customers will see'}
              </p>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={working}
                className="mt-3 rounded-lg border border-coal/15 bg-paper-soft px-4 py-2 text-sm font-semibold text-coal-deep transition hover:border-coal/30 disabled:opacity-50"
              >
                Choose image
              </button>
            </div>
          )}
        </div>

        {errors.poster && <p className="mt-1.5 text-[13px] text-ember">{errors.poster}</p>}

        <input ref={fileRef} type="file" accept={ACCEPT_ATTR} onChange={onPick} className="hidden" />
      </div>

      <label className="flex items-center gap-2.5 text-sm text-coal-deep">
        <input
          type="checkbox"
          checked={featured}
          onChange={(e) => setFeatured(e.target.checked)}
          className="h-4 w-4 rounded border-coal/30 accent-flame"
        />
        Feature this offer (pin it to the top of the grid)
      </label>

      <div className="flex flex-col-reverse gap-3 border-t border-coal/10 pt-5 sm:flex-row sm:justify-end">
        <ButtonLink href="/admin/offers" variant="secondary">
          Cancel
        </ButtonLink>
        <Button type="button" onClick={submit} disabled={pending || working}>
          {pending ? 'Saving' : editing ? 'Save changes' : 'Publish offer'}
        </Button>
      </div>
    </form>
  );
}
