export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatMoney(symbol: string, value: number): string {
  return `${symbol}${formatNumber(value)}`;
}

export function format(value: number) : string {
    return formatNumber(value);
}