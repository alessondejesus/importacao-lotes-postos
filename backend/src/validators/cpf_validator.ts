export function isValidCPF(value: unknown): boolean {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return false;
  }

  const cpf = String(value).replace(/\D/g, '');

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  const calculateDigit = (base: string, factor: number): number => {
    const sum = base
    .split('')
    .reduce((total, digit, index) => total + Number(digit) * (factor - index), 0);

    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  const firstDigit = calculateDigit(cpf.slice(0, 9), 10);
  const secondDigit = calculateDigit(cpf.slice(0, 10), 11);

  return cpf === cpf.slice(0, 9) + firstDigit + secondDigit;
}