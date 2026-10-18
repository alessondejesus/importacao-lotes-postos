import { isValidGasStationStatus } from '../../src/validators/gas-station-import/gas_station_status_validator';

describe('isValidGasStationStatus', () => {
  it('should return true for valid status', () => {
    expect(isValidGasStationStatus('Ativo')).toBe(true);
    expect(isValidGasStationStatus('Inativo')).toBe(true);
    expect(isValidGasStationStatus('em_implantacao')).toBe(true);
  });

  it('should return false for invalid status', () => {
    expect(isValidGasStationStatus('Desconhecido')).toBe(false);
    expect(isValidGasStationStatus('')).toBe(false);
  });
});
