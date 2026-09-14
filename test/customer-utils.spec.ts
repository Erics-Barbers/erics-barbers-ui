import {
  formatPrice,
  isValidEmail,
  normalizeEmail,
} from '../app/customer/_lib/customer-utils';

describe('customer utilities', () => {
  it('formats prices stored in pence as GBP', () => {
    expect(formatPrice(0)).toBe('£0.00');
    expect(formatPrice(1250)).toBe('£12.50');
  });

  it('normalizes email addresses for comparison and lookup', () => {
    expect(normalizeEmail('  Customer@Example.COM ')).toBe(
      'customer@example.com',
    );
  });

  it('checks whether an email address has a valid basic shape', () => {
    expect(isValidEmail('customer@example.com')).toBe(true);
    expect(isValidEmail('customer@example')).toBe(false);
    expect(isValidEmail('customer example.com')).toBe(false);
  });
});
