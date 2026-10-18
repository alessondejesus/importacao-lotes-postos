import { isValidDate } from '../../src/validators/gas-station-import/date_validator';

describe('isValidDate', () => {
  it('should return true for valid dates in DD/MM/YYYY format', () => {
    expect(isValidDate('18/10/2026')).toBe(true);
    expect(isValidDate('29/02/2024')).toBe(true);
  });

  it('should return false for invalid format', () => {
    expect(isValidDate('2026-10-18')).toBe(false);
    expect(isValidDate('18-10-2026')).toBe(false);
    expect(isValidDate('18/10/26')).toBe(false);
  });

  it('should return false for non-existent dates', () => {
    expect(isValidDate('32/10/2026')).toBe(false);
    expect(isValidDate('29/02/2023')).toBe(false);
    expect(isValidDate('31/04/2026')).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(isValidDate('')).toBe(false);
  });
});
