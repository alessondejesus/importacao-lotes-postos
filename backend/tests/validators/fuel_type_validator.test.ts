import { isValidFuelList, getInvalidFuels } from '../../src/validators/gas-station-import/fuel_type_validator';

describe('fuel_type_validator', () => {
  describe('isValidFuelList', () => {
    it('should return true for a valid single fuel', () => {
      expect(isValidFuelList('Gasolina Comum')).toBe(true);
    });

    it('should return true for multiple valid fuels', () => {
      expect(isValidFuelList('Gasolina Comum, Etanol, Diesel S10')).toBe(true);
    });

    it('should return false if any fuel is invalid', () => {
      expect(isValidFuelList('Gasolina Comum, Invalido, Etanol')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isValidFuelList('')).toBe(false);
    });
  });

  describe('getInvalidFuels', () => {
    it('should return empty array when all fuels are valid', () => {
      expect(getInvalidFuels('Gasolina Comum, Etanol')).toEqual([]);
    });

    it('should return array of invalid fuels', () => {
      expect(getInvalidFuels('Gasolina Comum, Agua, Suco')).toEqual(['Agua', 'Suco']);
    });
  });
});
