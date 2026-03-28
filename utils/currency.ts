export type CurrencyOption = {
  code: string;
  symbol: string;
  label: string;
};

export const currencyOptions: CurrencyOption[] = [
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'PHP', symbol: '₱', label: 'Philippine Peso' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'CAD', symbol: 'CA$', label: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar' },
  { code: 'SGD', symbol: 'S$', label: 'Singapore Dollar' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen' },
];

export function getCurrencySymbol(code: string): string {
  return currencyOptions.find((c) => c.code === code)?.symbol ?? '$';
}

export function getCurrencyLabel(code: string): string {
  const currency = currencyOptions.find((c) => c.code === code);
  if (!currency) return 'US Dollar ($)';
  return `${currency.code} (${currency.symbol})`;
}