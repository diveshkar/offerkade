// Phase 3 demo — pick an image, see it compressed to poster + thumb WebP.
// Dev-only visual check of the browser pipeline. Not linked from the site.
'use client';

import { useState } from 'react';
import {
  compressPoster,
  validateImageFile,
  formatBytes,
  type CompressedImage,
} from '@/lib/image/compress';

interface Result {
  originalName: string;
  originalSize: number;
  posterSize: number;
  thumbSize: number;
  posterUrl: string;
  thumbUrl: string;
}

export default function CompressDemoPage() {
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setResult(null);

    const check = validateImageFile(file);
    if (!check.ok) {
      setError(check.error ?? 'Invalid file.');
      return;
    }

    setBusy(true);
    try {
      const { poster, thumb }: CompressedImage = await compressPoster(file);
      setResult({
        originalName: file.name,
        originalSize: file.size,
        posterSize: poster.size,
        thumbSize: thumb.size,
        posterUrl: URL.createObjectURL(poster),
        thumbUrl: URL.createObjectURL(thumb),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Compression failed.');
    } finally {
      setBusy(false);
    }
  }

  const ratio = result ? (result.originalSize / result.posterSize).toFixed(1) : null;

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: 24, fontFamily: 'system-ui' }}>
      <h1>Phase 3 — Image compression demo</h1>
      <p style={{ color: '#666' }}>
        Pick a JPG/PNG/WebP (max 5MB). It&apos;s compressed to a 1080px poster and a 400px
        thumbnail, both WebP — entirely in your browser.
      </p>

      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onPick} />
      {busy && <p>Compressing…</p>}
      {error && <p style={{ color: 'crimson' }}>⚠️ {error}</p>}

      {result && (
        <div style={{ marginTop: 24 }}>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <tbody>
              <tr>
                <td style={cell}>Original</td>
                <td style={cell}>{result.originalName}</td>
                <td style={cell}>{formatBytes(result.originalSize)}</td>
              </tr>
              <tr>
                <td style={cell}>Poster (1080px WebP)</td>
                <td style={cell}>display</td>
                <td style={cell}>{formatBytes(result.posterSize)}</td>
              </tr>
              <tr>
                <td style={cell}>Thumbnail (400px WebP)</td>
                <td style={cell}>grid</td>
                <td style={cell}>{formatBytes(result.thumbSize)}</td>
              </tr>
            </tbody>
          </table>
          <p style={{ fontWeight: 600, marginTop: 12 }}>
            ✅ {ratio}× smaller ({formatBytes(result.originalSize)} →{' '}
            {formatBytes(result.posterSize)})
          </p>
          <div style={{ display: 'flex', gap: 16, marginTop: 16, alignItems: 'flex-start' }}>
            <figure>
              <img src={result.posterUrl} alt="poster" style={{ maxWidth: 320, borderRadius: 8 }} />
              <figcaption style={{ color: '#666' }}>Poster</figcaption>
            </figure>
            <figure>
              <img src={result.thumbUrl} alt="thumb" style={{ maxWidth: 120, borderRadius: 8 }} />
              <figcaption style={{ color: '#666' }}>Thumb</figcaption>
            </figure>
          </div>
        </div>
      )}
    </main>
  );
}

const cell: React.CSSProperties = {
  border: '1px solid #ddd',
  padding: '6px 10px',
  textAlign: 'left',
};
