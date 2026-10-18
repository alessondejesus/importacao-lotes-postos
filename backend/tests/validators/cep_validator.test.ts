import { isValidCEP } from '../../src/validators/cep_validator';

describe('isValidCEP', () => {
  it('should return true for valid CEP with 8 digits', () => {
    expect(isValidCEP('12345678')).toBe(true);
  });

  it('should return true for valid CEP with mask', () => {
    expect(isValidCEP('12345-678')).toBe(true);
  });

  it('should return false for invalid CEP (wrong length)', () => {
    expect(isValidCEP('1234567')).toBe(false);
    expect(isValidCEP('123456789')).toBe(false);
  });

  it('should return false for non-numeric CEP', () => {
    expect(isValidCEP('12345abc')).toBe(false);
  });

  it('should return false for empty or non-string/number values', () => {
    expect(isValidCEP('')).toBe(false);
    expect(isValidCEP(null)).toBe(false);
    expect(isValidCEP(undefined)).toBe(false);
    expect(isValidCEP({})).toBe(false);
  });

  it('should return true for numeric input', () => {
    expect(isValidCEP(12345678)).toBe(true);
  });
});
