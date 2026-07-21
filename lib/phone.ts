// Sri Lankan numbers only. Shops type the local form, e.g. 077 123 4567.
// Stored in E.164 so WhatsApp and tel links work.

const NON_DIGIT = /\D+/g;

export function normalizePhone(input: string): string | null {
  const d = input.replace(NON_DIGIT, '');
  if (/^0\d{9}$/.test(d)) return `+94${d.slice(1)}`;
  if (/^94\d{9}$/.test(d)) return `+${d}`;
  if (/^\d{9}$/.test(d)) return `+94${d}`;
  return null;
}

export function isValidPhone(input: string): boolean {
  return normalizePhone(input) !== null;
}

export function formatPhoneLocal(stored: string | null | undefined): string {
  if (!stored) return '';
  const d = stored.replace(NON_DIGIT, '');
  const local = d.startsWith('94') ? `0${d.slice(2)}` : d;
  return local.replace(/^(\d{3})(\d{3})(\d{4})$/, '$1 $2 $3');
}

export const PHONE_HELP = 'Sri Lankan number, e.g. 077 123 4567';
