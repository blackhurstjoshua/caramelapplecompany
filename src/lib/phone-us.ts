/**
 * Normalize a US phone string to E.164 (+1XXXXXXXXXX). Returns null if not a valid US number.
 */
export function normalizeUsPhoneE164(input: string): string | null {
  const digits = input.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  return null;
}

export function isValidUsPhone(input: string): boolean {
  return normalizeUsPhoneE164(input) !== null;
}
