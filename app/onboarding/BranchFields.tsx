'use client';

import { useState } from 'react';
import { Field, Input, Select, Textarea } from '@/app/components/ui';
import { PROVINCES, isDistrict } from '@/lib/sri-lanka';

export interface Branch {
  key: string;
  label: string;
  district: string;
  city: string;
  address: string;
  lat: number | null;
  lng: number | null;
}

export function emptyBranch(): Branch {
  return {
    key: Math.random().toString(36).slice(2),
    label: '',
    district: '',
    city: '',
    address: '',
    lat: null,
    lng: null,
  };
}

export default function BranchFields({
  branch,
  index,
  single,
  error,
  onChange,
  onRemove,
}: {
  branch: Branch;
  index: number;
  single: boolean;
  error?: string;
  onChange: (next: Branch) => void;
  onRemove?: () => void;
}) {
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState('');

  const set = <K extends keyof Branch>(field: K, value: Branch[K]) =>
    onChange({ ...branch, [field]: value });

  function useMyLocation() {
    setLocateError('');

    if (!navigator.geolocation) {
      setLocateError('Your browser cannot share a location. Type the address instead.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.latitude}&lon=${coords.longitude}`,
            { headers: { Accept: 'application/json' } },
          );
          const data = await res.json();
          const a = data.address ?? {};

          const guessed = [a.state_district, a.county, a.city, a.town]
            .map((v: string) => String(v ?? '').replace(/\s*District$/i, '').trim())
            .find(isDistrict);

          onChange({
            ...branch,
            address: data.display_name ?? branch.address,
            city: a.suburb ?? a.town ?? a.village ?? a.city ?? branch.city,
            district: guessed ?? branch.district,
            lat: coords.latitude,
            lng: coords.longitude,
          });
        } catch {
          setLocateError('Could not look up that location. Type the address instead.');
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        setLocateError('Location permission was denied. Type the address instead.');
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  const body = (
    <div className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="District" required error={error}>
          <Select
            value={branch.district}
            invalid={Boolean(error)}
            onChange={(e) => set('district', e.target.value)}
          >
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
            value={branch.city}
            onChange={(e) => set('city', e.target.value)}
            placeholder="Dehiwala"
          />
        </Field>
      </div>

      {!single && (
        <Field label="Branch name" hint="Optional">
          <Input
            value={branch.label}
            onChange={(e) => set('label', e.target.value)}
            placeholder="Nugegoda outlet"
          />
        </Field>
      )}

      <div>
        <div className="mb-1.5 flex items-baseline justify-between gap-3">
          <span className="text-sm font-medium text-coal-deep">Address</span>
          <button
            type="button"
            onClick={useMyLocation}
            disabled={locating}
            className="text-xs font-semibold text-flame-deep transition hover:underline disabled:opacity-50"
          >
            {locating ? 'Finding you' : 'Use my current location'}
          </button>
        </div>
        <Textarea
          value={branch.address}
          onChange={(e) => set('address', e.target.value)}
          rows={2}
          placeholder="42 Galle Road, Dehiwala"
        />
        {locateError ? (
          <p className="mt-1.5 text-[13px] text-ember">{locateError}</p>
        ) : (
          branch.lat !== null && (
            <p className="mt-1.5 text-[12px] text-coal/45">
              Pinned at {branch.lat.toFixed(4)}, {branch.lng?.toFixed(4)}
            </p>
          )
        )}
      </div>
    </div>
  );

  if (single) return body;

  return (
    <div className="rounded-2xl border border-coal/12 bg-paper p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-coal-deep">
          {index === 0 ? 'Main branch' : `Branch ${index + 1}`}
        </p>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-lg px-2.5 py-1 text-[13px] font-medium text-coal/50 transition hover:bg-ember/8 hover:text-ember"
          >
            Remove
          </button>
        )}
      </div>
      {body}
    </div>
  );
}
