export function isValidDate(value: string): boolean {
  if (!value) return false;

  const regex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!regex.test(value)) return false;

  const parts = value.split('/').map(Number);
  const day = parts[0]!;
  const month = parts[1]!;
  const year = parts[2]!;

  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}