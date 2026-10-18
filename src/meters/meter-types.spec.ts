import { MAX_TEXT_LENGTH, validateEntryValue } from './meter-types.js';

describe('validateEntryValue', () => {
  const activities = { type: 'activities' as const, options: ['run', 'swim'] };

  it.each([
    [{ type: 'mood' as const }, 'great'],
    [{ type: 'quantity' as const }, 'none'],
    [{ type: 'boolean' as const }, true],
    [{ type: 'number' as const }, -2.5],
    [{ type: 'text' as const }, ''],
    [{ type: 'text' as const }, 'x'.repeat(MAX_TEXT_LENGTH)],
    [activities, []],
    [activities, ['swim', 'run']],
  ])('accepts %j with %j', (meter, value) => {
    expect(validateEntryValue(meter, value)).toBeUndefined();
  });

  it.each([
    [{ type: 'mood' as const }, 'Good'],
    [{ type: 'quantity' as const }, undefined],
    [{ type: 'boolean' as const }, 1],
    [{ type: 'number' as const }, NaN],
    [{ type: 'number' as const }, Infinity],
    [{ type: 'text' as const }, 'x'.repeat(MAX_TEXT_LENGTH + 1)],
    [activities, ['run', 'dance']],
    [activities, ['run', 'run']],
    [activities, [1]],
    [{ type: 'activities' as const }, ['run']],
  ])('rejects %j with %j', (meter, value) => {
    expect(validateEntryValue(meter, value)).toEqual(expect.any(String));
  });
});
