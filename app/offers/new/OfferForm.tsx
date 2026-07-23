'use client';

import { useRef, useState, useTransition } from 'react';
import { Alert, Button, ButtonLink, Field, Input, Select, Textarea } from '@/app/components/ui';
import OfferPreview from '@/app/offers/new/OfferPreview';
import { ACCEPT_ATTR, compressPoster, formatBytes, validateImageFile } from '@/lib/image/compress';
import { saveOffer } from '@/app/offers/new/actions';
import type { Branch, Category, Offer } from '@/lib/database.types';

interface Prepared {
  poster: File;
  thumb: File;
  preview: string;
  originalSize: number;
}

type Errors = Record<string, string>;
type Intent = 'draft' | 'publish';

function branchName(b: Branch) {
  return b.label || [b.city, b.district].filter(Boolean).join(', ') || b.district;
}

export default function OfferForm({
  categories,
  branches,
  shopName,
  verified,
  offer = null,
  initialBranchIds,
}: {
  categories: Category[];
  branches: Branch[];
  shopName: string;
  verified: boolean;
  offer?: Offer | null;
  initialBranchIds?: string[];
}) {
  const today = new Date().toISOString().slice(0, 10);
  const multiBranch = branches.length > 1;
  const editing = Boolean(offer);

  const [pending, startTransition] = useTransition();
  const [intent, setIntent] = useState<Intent | null>(null);
  const [formError, setFormError] = useState('');
  const [errors, setErrors] = useState<Errors>({});

  const [title, setTitle] = useState(offer?.title ?? '');
  const [categoryId, setCategoryId] = useState(offer?.category_id ? String(offer.category_id) : '');
  const [description, setDescription] = useState(offer?.description ?? '');
  const [startDate, setStartDate] = useState(offer?.start_date ?? today);
  const [endDate, setEndDate] = useState(offer?.end_date ?? '');
  const [picked, setPicked] = useState<string[]>(
    initialBranchIds && initialBranchIds.length > 0 ? initialBranchIds : branches.map((b) => b.id),
  );

  const [image, setImage] = useState<Prepared | null>(null);
  const existingPoster = offer?.poster_url ?? null;
  const [working, setWorking] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const selected = branches.filter((b) => picked.includes(b.id));
  const categoryName = categories.find((c) => String(c.id) === categoryId)?.name ?? '';
  const previewCity = selected[0] ? branchName(selected[0]) : branches[0] ? branchName(branches[0]) : '';
  const previewImage = image?.preview ?? existingPoster;
  const hasPoster = Boolean(image) || Boolean(existingPoster);

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

  function validate(publish: boolean): Errors {
    const next: Errors = {};

    if (title.trim().length < 5) next.title = 'Give the offer a clear title, at least 5 characters.';

    if (publish) {
      if (!categoryId) next.category = 'Choose a category.';
      if (!endDate) next.endDate = 'Choose the day this offer ends.';
      else if (endDate < today) next.endDate = 'The end date cannot be in the past.';
      else if (startDate && endDate < startDate) next.endDate = 'The end date must follow the start date.';
      if (!hasPoster) next.poster = 'Add a poster image.';
      if (multiBranch && picked.length === 0) next.branches = 'Choose at least one branch.';
    } else if (endDate && startDate && endDate < startDate) {
      next.endDate = 'The end date must follow the start date.';
    }

    return next;
  }

  function submit(next: Intent) {
    setFormError('');

    const found = validate(next === 'publish');
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setFormError('Check the highlighted fields and try again.');
      return;
    }

    const data = new FormData();
    data.set('intent', next);
    if (offer) data.set('offer_id', offer.id);
    data.set('title', title.trim());
    data.set('category_id', categoryId);
    data.set('description', description.trim());
    data.set('start_date', startDate);
    data.set('end_date', endDate);
    data.set('branch_ids', JSON.stringify(picked));
    if (image) {
      data.set('poster', image.poster);
      data.set('thumb', image.thumb);
    }

    setIntent(next);
    startTransition(async () => {
      const result = await saveOffer(data);
      if (result?.error) setFormError(result.error);
      setIntent(null);
    });
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
      <form onSubmit={(e) => e.preventDefault()} noValidate className="flex flex-col gap-5">
        {formError && <Alert tone="error">{formError}</Alert>}

        <Field label="Offer title" required error={errors.title}>
          <Input
            value={title}
            invalid={Boolean(errors.title)}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Buy 1 Get 1 Free: Large Pizzas"
            maxLength={90}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Category" required error={errors.category}>
            <Select
              value={categoryId}
              invalid={Boolean(errors.category)}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Choose</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Starts">
            <Input
              type="date"
              value={startDate}
              min={today}
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
            rows={2}
            maxLength={600}
            placeholder="What is included, and any conditions customers should know."
          />
        </Field>

        {multiBranch && (
          <div>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <span className="text-sm font-medium text-coal-deep">
                Branches<span className="ml-0.5 text-coal/40" aria-hidden>*</span>
              </span>
              <button
                type="button"
                onClick={() =>
                  setPicked(picked.length === branches.length ? [] : branches.map((b) => b.id))
                }
                className="text-xs font-semibold text-flame-deep transition hover:underline"
              >
                {picked.length === branches.length ? 'Clear all' : 'Select all'}
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {branches.map((b) => {
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
            {errors.branches && (
              <p className="mt-1.5 text-[13px] text-ember">{errors.branches}</p>
            )}
          </div>
        )}

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
                <img
                  src={previewImage}
                  alt=""
                  className="h-14 w-14 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-coal-deep">
                    {image ? 'Ready to publish' : 'Current poster'}
                  </p>
                  {image ? (
                    <p className="mt-0.5 text-[13px] text-coal/55">
                      {formatBytes(image.originalSize)} compressed to {formatBytes(image.poster.size)}
                    </p>
                  ) : (
                    <p className="mt-0.5 text-[13px] text-coal/55">Keep it, or replace with a new image.</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="shrink-0 text-[13px] font-semibold text-flame-deep hover:underline"
                >
                  Replace
                </button>
              </div>
            ) : (
              <div className="py-6 text-center">
                <p className="text-sm text-coal/60">
                  {working ? 'Compressing your image' : 'Add the poster customers will see'}
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

          <input
            ref={fileRef}
            type="file"
            accept={ACCEPT_ATTR}
            onChange={onPick}
            className="hidden"
          />
        </div>

        <div className="border-t border-coal/10 pt-5">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <ButtonLink href="/dashboard" variant="secondary">
              Cancel
            </ButtonLink>
            <Button
              type="button"
              variant="secondary"
              onClick={() => submit('draft')}
              disabled={pending || working}
            >
              {pending && intent === 'draft' ? 'Saving' : 'Save as draft'}
            </Button>
            <Button type="button" onClick={() => submit('publish')} disabled={pending || working}>
              {pending && intent === 'publish' ? 'Publishing' : 'Publish offer'}
            </Button>
          </div>
          <p className="mt-3 text-right text-[12px] leading-5 text-coal/50">
            Once you publish, the offer goes live and can’t be edited. Save it as a draft to keep making changes.
          </p>
        </div>
      </form>

      <div className="lg:sticky lg:top-8">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-coal/45">
          Live preview
        </p>
        <div className="flex justify-center rounded-2xl border border-coal/10 bg-paper p-5 lg:justify-start">
          <OfferPreview
            title={title}
            category={categoryName}
            city={previewCity}
            endDate={endDate}
            branchNames={selected.map(branchName)}
            shopName={shopName}
            verified={verified}
            preview={previewImage}
          />
        </div>

        <p className="mt-2.5 text-[12px] leading-5 text-coal/45">
          {editing
            ? 'Editing a saved draft. Featured is shown as an example.'
            : 'How your offer looks in the grid. Featured is shown as an example.'}
        </p>
      </div>
    </div>
  );
}
