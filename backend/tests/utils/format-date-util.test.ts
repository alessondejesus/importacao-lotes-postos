import { formatDate } from '../../src/utils/format-date-util';

describe('formatDate', () => {
  it('should format a valid date correctly', () => {
    expect(formatDate('18/10/2026', 'dd/MM/yyyy', 'yyyy-MM-dd')).toBe('2026-10-18');
  });

  it('should return null for empty or null values', () => {
    expect(formatDate(null, 'dd/MM/yyyy', 'yyyy-MM-dd')).toBeNull();
    expect(formatDate('', 'dd/MM/yyyy', 'yyyy-MM-dd')).toBeNull();
    expect(formatDate('  ', 'dd/MM/yyyy', 'yyyy-MM-dd')).toBeNull();
  });

  it('should throw error for invalid dates', () => {
    expect(() => formatDate('32/10/2026', 'dd/MM/yyyy', 'yyyy-MM-dd')).toThrow();
    expect(() => formatDate('invalid', 'dd/MM/yyyy', 'yyyy-MM-dd')).toThrow();
  });
});
