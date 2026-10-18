import { isValidCNPJ } from '../../src/validators/cnpj_validator';

describe('isValidCNPJ', () => {
  it('should return true for a valid CNPJ', () => {
    // Valid CNPJs
    expect(isValidCNPJ('11.222.333/0001-81')).toBe(true);
    expect(isValidCNPJ('11222333000181')).toBe(true);
  });

  it('should return false for CNPJ with all same digits', () => {
    expect(isValidCNPJ('00000000000000')).toBe(false);
    expect(isValidCNPJ('11111111111111')).toBe(false);
  });

  it('should return false for CNPJ with invalid length', () => {
    expect(isValidCNPJ('1234567890123')).toBe(false);
    expect(isValidCNPJ('123456789012345')).toBe(false);
  });

  it('should return false for CNPJ with invalid check digits', () => {
    expect(isValidCNPJ('11.222.333/0001-82')).toBe(false);
  });

  it('should return false for non-string/number values', () => {
    expect(isValidCNPJ(null)).toBe(false);
    expect(isValidCNPJ(undefined)).toBe(false);
    expect(isValidCNPJ([])).toBe(false);
  });
});
