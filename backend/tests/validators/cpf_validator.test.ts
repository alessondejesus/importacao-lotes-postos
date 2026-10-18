import { isValidCPF } from '../../src/validators/cpf_validator';

describe('isValidCPF', () => {
  it('should return true for a valid CPF', () => {
    expect(isValidCPF('123.456.789-09')).toBe(true);
    expect(isValidCPF('12345678909')).toBe(true);
  });

  it('should return false for CPF with all same digits', () => {
    expect(isValidCPF('11111111111')).toBe(false);
  });

  it('should return false for CPF with invalid length', () => {
    expect(isValidCPF('1234567890')).toBe(false);
    expect(isValidCPF('123456789012')).toBe(false);
  });

  it('should return false for CPF with invalid check digits', () => {
    expect(isValidCPF('12345678900')).toBe(false);
  });

  it('should return false for non-string/number values', () => {
    expect(isValidCPF(null)).toBe(false);
    expect(isValidCPF({})).toBe(false);
  });
});
