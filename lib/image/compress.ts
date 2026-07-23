// ============================================================
// OfferCeylon — Phase 3 — Browser-side image pipeline.
// Runs in the USER'S browser before upload: validate → resize →
// WebP compress → produce a display poster + a grid thumbnail.
// A ~6MB phone photo becomes ~150KB, no visible quality loss.
// ============================================================
'use client';

import imageCompression from 'browser-image-compression';

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB hard limit (pre-compression)
export const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  // iPhones hand the file picker a HEIC/HEIF photo. Safari can decode these to
  // a canvas, so browser-image-compression converts them to WebP like any other.
  'image/heic',
  'image/heif',
] as const;

/** `accept` attribute string for the file <input>. */
export const ACCEPT_ATTR = ACCEPTED_TYPES.join(',');

export interface CompressedImage {
  /** ~1080px WebP, for the offer detail page. */
  poster: File;
  /** ~400px WebP, for the grid. */
  thumb: File;
}

export interface ValidationResult {
  ok: boolean;
  error?: string;
}

const ACCEPTED_EXT = /\.(jpe?g|png|webp|heic|heif)$/i;

/** Validate a picked file: type + size. Enforced in the form UI. */
export function validateImageFile(file: File): ValidationResult {
  // Some mobile browsers report an empty MIME type for camera/gallery photos,
  // so fall back to the file extension before rejecting.
  const typeOk = ACCEPTED_TYPES.includes(file.type as (typeof ACCEPTED_TYPES)[number]);
  const extOk = ACCEPTED_EXT.test(file.name);
  if (!typeOk && !(file.type === '' && extOk)) {
    return { ok: false, error: 'Please upload a JPG, PNG, or WebP image.' };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, error: 'Image is too large. Maximum size is 10MB.' };
  }
  return { ok: true };
}

/**
 * Compress a validated image into a poster + thumbnail, both WebP.
 * Throws if the file fails validation — call validateImageFile first
 * for user-facing errors, or catch here.
 */
export async function compressPoster(file: File): Promise<CompressedImage> {
  const check = validateImageFile(file);
  if (!check.ok) throw new Error(check.error);

  // Web workers speed compression up but throw on some mobile browsers
  // (notably older iOS Safari). Fall back to the main thread if they fail.
  async function shrink(maxWidthOrHeight: number, initialQuality: number) {
    const opts = { maxWidthOrHeight, fileType: 'image/webp', initialQuality } as const;
    try {
      return await imageCompression(file, { ...opts, useWebWorker: true });
    } catch {
      return await imageCompression(file, { ...opts, useWebWorker: false });
    }
  }

  const poster = await shrink(1080, 0.8);
  const thumb = await shrink(400, 0.75);

  // Give them .webp names so the upload/storage keys are clean.
  const base = file.name.replace(/\.[^.]+$/, '');
  return {
    poster: renameFile(poster, `${base}.webp`),
    thumb: renameFile(thumb, `${base}-thumb.webp`),
  };
}

/** browser-image-compression returns a File/Blob; ensure it has our name + type. */
function renameFile(blob: Blob, name: string): File {
  return new File([blob], name, { type: 'image/webp' });
}

/** Human-readable size, e.g. "148 KB". Handy for the demo/upload UI. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
