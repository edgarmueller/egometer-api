import type { MeterTypeDto } from './dto/meter-type.dto.js';

export const METER_TYPES = [
  'mood',
  'quantity',
  'boolean',
  'number',
  'text',
  'activities',
] as const;

export type MeterType = (typeof METER_TYPES)[number];

// ordered from worst to best
export const MOOD_VALUES = ['awful', 'bad', 'okay', 'good', 'great'];
export const QUANTITY_VALUES = ['none', 'a_bit', 'a_lot'];
export const DEFAULT_ACTIVITIES = [
  // people
  'family',
  'friends',
  'partner',
  // active
  'sports',
  'outdoors',
  'travel',
  // leisure
  'reading',
  'gaming',
  'movies_tv',
  'music',
  // duties
  'work',
  'chores',
  // growth
  'learning',
  'side_project',
];
export const MAX_TEXT_LENGTH = 10_000;

export const METER_TYPE_DEFINITIONS: MeterTypeDto[] = [
  {
    type: 'mood',
    description: 'One mood per day, from awful to great',
    values: MOOD_VALUES,
  },
  {
    type: 'quantity',
    description: 'How much of something per day',
    values: QUANTITY_VALUES,
  },
  { type: 'boolean', description: 'Yes or no' },
  {
    type: 'number',
    description: 'A number, optionally with a daily goal',
  },
  {
    type: 'text',
    description: `Free text of up to ${MAX_TEXT_LENGTH} characters, e.g. a journal`,
  },
  {
    type: 'activities',
    description: "Any number of tags from the meter's options",
    defaultOptions: DEFAULT_ACTIVITIES,
  },
];

/**
 * Checks an entry value against the meter it belongs to.
 *
 * @returns why the value is invalid, or undefined if it's valid
 */
export function validateEntryValue(
  meter: { type: MeterType; options?: string[] },
  value: unknown,
): string | undefined {
  const oneOf = (allowed: string[]) =>
    typeof value === 'string' && allowed.includes(value)
      ? undefined
      : `value must be one of: ${allowed.join(', ')}`;

  switch (meter.type) {
    case 'mood':
      return oneOf(MOOD_VALUES);
    case 'quantity':
      return oneOf(QUANTITY_VALUES);
    case 'boolean':
      return typeof value === 'boolean' ? undefined : 'value must be a boolean';
    case 'number':
      return typeof value === 'number' && Number.isFinite(value)
        ? undefined
        : 'value must be a number';
    case 'text':
      return typeof value === 'string' && value.length <= MAX_TEXT_LENGTH
        ? undefined
        : `value must be a string of at most ${MAX_TEXT_LENGTH} characters`;
    case 'activities': {
      const options = meter.options ?? [];
      const valid =
        Array.isArray(value) &&
        value.every((v) => typeof v === 'string' && options.includes(v)) &&
        new Set(value).size === value.length;
      return valid
        ? undefined
        : `value must be a list of distinct options: ${options.join(', ')}`;
    }
  }
}
