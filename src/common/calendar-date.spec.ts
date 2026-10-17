import { daysBetween, isCalendarDate } from './calendar-date.js';

describe('isCalendarDate', () => {
  it.each(['2026-01-01', '2024-02-29', '2026-12-31'])('accepts %s', (date) => {
    expect(isCalendarDate(date)).toBe(true);
  });

  it.each([
    '2026-02-29',
    '2026-13-01',
    '2026-1-1',
    '2026-01-01T00:00',
    '',
    20260101,
  ])('rejects %j', (date) => {
    expect(isCalendarDate(date)).toBe(false);
  });
});

describe('daysBetween', () => {
  it('counts calendar days, including across DST changes', () => {
    expect(daysBetween('2026-03-01', '2026-03-31')).toBe(30);
    expect(daysBetween('2026-10-31', '2026-10-01')).toBe(-30);
  });
});
