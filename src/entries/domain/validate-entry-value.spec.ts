import { validateEntryValue } from './validate-entry-value'
import { MeterType } from '../../meters/domain/meter-type'
import { InvalidEntryValueError } from './errors/invalid-entry-value.error'

describe('validateEntryValue', () => {
  describe('BOOLEAN', () => {
    it('accepts a boolean', () => {
      expect(() => validateEntryValue(MeterType.Boolean, true)).not.toThrow()
      expect(() => validateEntryValue(MeterType.Boolean, false)).not.toThrow()
    })

    it('rejects a non-boolean', () => {
      expect(() => validateEntryValue(MeterType.Boolean, 'true')).toThrow(
        InvalidEntryValueError,
      )
    })
  })

  describe('NUMBER', () => {
    it('accepts a number', () => {
      expect(() => validateEntryValue(MeterType.Number, 42)).not.toThrow()
      expect(() => validateEntryValue(MeterType.Number, 0)).not.toThrow()
    })

    it('rejects a non-number', () => {
      expect(() => validateEntryValue(MeterType.Number, '42')).toThrow(
        InvalidEntryValueError,
      )
      expect(() => validateEntryValue(MeterType.Number, NaN)).toThrow(
        InvalidEntryValueError,
      )
    })
  })

  describe('TEXT', () => {
    it('accepts a string', () => {
      expect(() => validateEntryValue(MeterType.Text, 'hello')).not.toThrow()
    })

    it('rejects a non-string', () => {
      expect(() => validateEntryValue(MeterType.Text, 42)).toThrow(
        InvalidEntryValueError,
      )
    })
  })

  describe('MOOD', () => {
    it('accepts a valid mood value', () => {
      expect(() => validateEntryValue(MeterType.Mood, 'good')).not.toThrow()
      expect(() => validateEntryValue(MeterType.Mood, 'dabomb')).not.toThrow()
    })

    it('rejects an invalid mood value', () => {
      expect(() => validateEntryValue(MeterType.Mood, 'great')).toThrow(
        InvalidEntryValueError,
      )
    })
  })

  describe('QUANTITY', () => {
    it('accepts a valid quantity value', () => {
      expect(() =>
        validateEntryValue(MeterType.Quantity, 'a_bit'),
      ).not.toThrow()
    })

    it('rejects an invalid quantity value', () => {
      expect(() => validateEntryValue(MeterType.Quantity, 'lots')).toThrow(
        InvalidEntryValueError,
      )
    })
  })

  describe('ACTIVITIES', () => {
    it('accepts a valid array of activity tags', () => {
      expect(() =>
        validateEntryValue(MeterType.Activities, ['work', 'sports']),
      ).not.toThrow()
      expect(() => validateEntryValue(MeterType.Activities, [])).not.toThrow()
    })

    it('rejects a non-array', () => {
      expect(() => validateEntryValue(MeterType.Activities, 'work')).toThrow(
        InvalidEntryValueError,
      )
    })

    it('rejects an array with an invalid tag', () => {
      expect(() =>
        validateEntryValue(MeterType.Activities, ['work', 'invalid_tag']),
      ).toThrow(InvalidEntryValueError)
    })
  })
})
