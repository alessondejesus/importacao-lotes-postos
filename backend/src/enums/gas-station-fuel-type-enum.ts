export enum GasStationFuelTypeEnum {
  REGULAR_GASOLINE = 'regular_gasoline',
  ADDITIVATED_GASOLINE = 'additivated_gasoline',
  ETHANOL = 'ethanol',
  DIESEL_S10 = 'diesel_s10',
  REGULAR_DIESEL = 'regular_diesel',
  ARLA_32 = 'arla_32',
  GNV = 'gnv',
}

export function parseFuelType(value: string): GasStationFuelTypeEnum | null {
  const normalized = value.trim().toLowerCase();

  const mapping: Record<string, GasStationFuelTypeEnum> = {
    'gasolina comum': GasStationFuelTypeEnum.REGULAR_GASOLINE,
    'gasolina aditivada': GasStationFuelTypeEnum.ADDITIVATED_GASOLINE,
    'etanol': GasStationFuelTypeEnum.ETHANOL,
    'diesel s10': GasStationFuelTypeEnum.DIESEL_S10,
    'diesel comum': GasStationFuelTypeEnum.REGULAR_DIESEL,
    'arla 32': GasStationFuelTypeEnum.ARLA_32,
    'gnv': GasStationFuelTypeEnum.GNV,
  };

  return mapping[normalized] ?? null;
}