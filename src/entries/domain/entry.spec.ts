import { Entry } from './entry'
import { MeterType } from '../../meters/domain/meter-type'
import { InvalidEntryValueError } from './errors/invalid-entry-value.error'

describe('Entry', () => {
  it('should create a new entry when the value matches the meter type', () => {
    const entry = Entry.create(
      {
        date: '2026-07-21',
        meterId: 'mtr-1',
        userId: 'usr-1',
        value: 5,
      },
      MeterType.Number,
    )
    expect(entry).toBeDefined()
    expect(entry.id).toMatch(/^ent-/)
    expect(entry.value).toBe(5)
  })

  it('should throw when the value does not match the meter type', () => {
    expect(() =>
      Entry.create(
        {
          date: '2026-07-21',
          meterId: 'mtr-1',
          userId: 'usr-1',
          value: 'not-a-number',
        },
        MeterType.Number,
      ),
    ).toThrow(InvalidEntryValueError)
  })

  it('should update the value when valid', () => {
    const entry = Entry.create(
      {
        date: '2026-07-21',
        meterId: 'mtr-1',
        userId: 'usr-1',
        value: true,
      },
      MeterType.Boolean,
    )
    entry.updateValue(false, MeterType.Boolean)
    expect(entry.value).toBe(false)
  })

  it('should throw when updating with an invalid value', () => {
    const entry = Entry.create(
      {
        date: '2026-07-21',
        meterId: 'mtr-1',
        userId: 'usr-1',
        value: true,
      },
      MeterType.Boolean,
    )
    expect(() => entry.updateValue('nope', MeterType.Boolean)).toThrow(
      InvalidEntryValueError,
    )
  })
})
