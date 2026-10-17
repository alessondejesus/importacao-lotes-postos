import {GasStationFuelTypeEnum} from "../enums/gas-station-fuel-type-enum";
import {GasStationStatusEnum} from "../enums/gas-station-status-enum";

export interface GasStation {
  cnpj: string;
  name: string;
  tradeName: string;
  brand: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  responsibleCpf: string;
  responsibleName: string;
  responsibleEmail: string;
  responsiblePosition: string;
  fuels: GasStationFuelTypeEnum[];
  status: GasStationStatusEnum;
  foundingDate: string;
  pumpCount: number;
  laneCount: number;
  observations?: string;
}