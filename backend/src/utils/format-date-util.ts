import {parse, format, isValid} from 'date-fns';

export function formatDate(
  value: string | null | undefined,
  inputFormat: string,
  outputFormat: string,
): string | null {
  if (!value?.trim()) {
    return null;
  }

  const date = parse(value, inputFormat, new Date());

  if (!isValid(date)) {
    throw new Error(`data inválida: ${value}`);
  }

  return format(date, outputFormat);
}