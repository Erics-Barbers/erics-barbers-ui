export const SHOP_TIME_ZONE = 'Europe/London';

export function toDateInputValue(date: Date): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: SHOP_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(date);
  const partValue = (type: string) =>
    parts.find((part) => part.type === type)?.value;

  return `${partValue('year')}-${partValue('month')}-${partValue('day')}`;
}

export function addDays(date: string, days: number): string {
  const [year, month, day] = parseDate(date);

  return new Date(Date.UTC(year, month - 1, day + days))
    .toISOString()
    .slice(0, 10);
}

export function addCalendarMonths(date: string, monthsToAdd: number): string {
  const [year, month, day] = parseDate(date);
  const targetMonthIndex = month - 1 + monthsToAdd;
  const targetYear = year + Math.floor(targetMonthIndex / 12);
  const normalizedMonthIndex = ((targetMonthIndex % 12) + 12) % 12;
  const targetMonth = normalizedMonthIndex + 1;
  const targetDay = Math.min(day, getDaysInMonth(targetYear, targetMonth));

  return [
    targetYear,
    String(targetMonth).padStart(2, '0'),
    String(targetDay).padStart(2, '0'),
  ].join('-');
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function parseDate(date: string): [number, number, number] {
  return date.split('-').map(Number) as [number, number, number];
}

export function isDateInBookingWindow(
  date: string,
  earliestBookingDate: string,
  latestBookingDate: string,
): boolean {
  return date >= earliestBookingDate && date <= latestBookingDate;
}

export function getRestoredDate(
  date: string | undefined,
  earliestBookingDate: string,
  latestBookingDate: string,
): string {
  return date && isDateInBookingWindow(date, earliestBookingDate, latestBookingDate)
    ? date
    : earliestBookingDate;
}

export function formatBookingTime(date: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date));
}

export function getDateInputValue(date: string): string {
  return toDateInputValue(new Date(date));
}
