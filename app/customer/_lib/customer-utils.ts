const gbpPriceFormatter = new Intl.NumberFormat('en-GB', {
  currency: 'GBP',
  style: 'currency',
});

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function formatPrice(pricePence: number): string {
  return gbpPriceFormatter.format(pricePence / 100);
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidEmail(value: string): boolean {
  return emailPattern.test(value);
}
