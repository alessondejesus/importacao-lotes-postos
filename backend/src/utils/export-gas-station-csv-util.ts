import {format} from 'date-fns';
import {GasStationStatusEnum} from "../enums/gas-station-status-enum";
import {GasStationFuelTypeEnum} from "../enums/gas-station-fuel-type-enum";

export function escapeCSV(value: any): string {
  if (value === null || value === undefined) return '';
  let str = String(value);
  if (str.includes(';') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    str = '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

export function formatCNPJ(value: any): string {
  if (value === null || value === undefined) return '';
  const clean = value.replace(/\D/g, '').padStart(14, '0');
  return clean.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

export function formatCPF(value: any): string {
  if (value === null || value === undefined) return '';
  const clean = value.replace(/\D/g, '').padStart(11, '0');
  return clean.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
}

export function formatCEP(value: any): string {
  if (value === null || value === undefined) return '';
  const clean = value.replace(/\D/g, '').padStart(8, '0');
  return clean.replace(/^(\d{5})(\d{3})$/, '$1-$2');
}

export function formatFuels(fuelsStr: any): string {
  if (fuelsStr === null || fuelsStr === undefined) return '';
  const fuels = String(fuelsStr).split(',');
  const mapping: Record<string, string> = {
    [GasStationFuelTypeEnum.REGULAR_GASOLINE]: 'Gasolina Comum',
    [GasStationFuelTypeEnum.ADDITIVATED_GASOLINE]: 'Gasolina Aditivada',
    [GasStationFuelTypeEnum.ETHANOL]: 'Etanol',
    [GasStationFuelTypeEnum.DIESEL_S10]: 'Diesel S10',
    [GasStationFuelTypeEnum.REGULAR_DIESEL]: 'Diesel Comum',
    [GasStationFuelTypeEnum.ARLA_32]: 'Arla 32',
    [GasStationFuelTypeEnum.GNV]: 'GNV',
  };

  const formatted = fuels
  .map(f => mapping[f as GasStationFuelTypeEnum] || f)
  .filter(Boolean);

  return escapeCSV(formatted.join(','));
}

export function formatStatus(status: any): string {
  if (status === null || status === undefined) return '';
  const mapping: Record<string, string> = {
    [GasStationStatusEnum.ACTIVE]: 'Ativo',
    [GasStationStatusEnum.INACTIVE]: 'Inativo',
    [GasStationStatusEnum.UNDER_IMPLEMENTATION]: 'Em Implantação',
  };
  return escapeCSV(mapping[status as GasStationStatusEnum] || status);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  try {
    return format(d, 'dd/MM/yyyy');
  } catch {
    return '';
  }
}