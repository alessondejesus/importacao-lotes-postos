export enum GasStationStatusEnum {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  UNDER_IMPLEMENTATION = 'under_implementation',
}

export function parseStatus(value: string): GasStationStatusEnum | null {
  const normalized = value.trim().toLowerCase();

  const mapping: Record<string, GasStationStatusEnum> = {
    'ativo': GasStationStatusEnum.ACTIVE,
    'inativo': GasStationStatusEnum.INACTIVE,
    'em_implantacao': GasStationStatusEnum.UNDER_IMPLEMENTATION,
  };

  return mapping[normalized] ?? null;
}