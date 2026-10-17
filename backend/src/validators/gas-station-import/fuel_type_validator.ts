import { parseFuelType } from "../../enums/gas-station-fuel-type-enum";

export function isValidFuelType(value: string): boolean {
  if (!value) return false;
  return parseFuelType(value) !== null;
}

export function isValidFuelList(value: string): boolean {
  if (!value) return false;
  const fuels = value.split(',').map(f => f.trim());
  if (fuels.length === 0 || (fuels.length === 1 && fuels[0] === '')) return false;
  return fuels.every(fuel => isValidFuelType(fuel));
}

export function getInvalidFuels(value: string): string[] {
  if (!value) return [];
  const fuels = value.split(',').map(f => f.trim());
  return fuels.filter(fuel => !isValidFuelType(fuel));
}
