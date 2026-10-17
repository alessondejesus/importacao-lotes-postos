export function isValidCEP(value: unknown): boolean {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return false;
  }

  return /^\d{8}$/.test(String(value).replace(/\D/g, ''));
}