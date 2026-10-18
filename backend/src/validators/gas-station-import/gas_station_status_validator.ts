import {parseStatus} from "../../enums/gas-station-status-enum";

export function isValidGasStationStatus(value: string): boolean {
  if (!value) return false;
  return parseStatus(value) !== null;
}
