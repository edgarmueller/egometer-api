import { Meter } from './meter'
import { MeterType } from './meter-type'

describe('Meter', () => {
  it('should create a new meter with defaults', () => {
    const meter = Meter.create({
      name: 'Water',
      type: MeterType.Number,
      userId: 'usr-1',
      color: '#ffffff',
      icon: 'droplet',
    })
    expect(meter).toBeDefined()
    expect(meter.id).toMatch(/^mtr-/)
    expect(meter.sortOrder).toBe(0)
  })

  it('should rename the meter', () => {
    const meter = Meter.create({
      name: 'Water',
      type: MeterType.Number,
      userId: 'usr-1',
      color: '#ffffff',
      icon: 'droplet',
    })
    meter.rename('Hydration')
    expect(meter.name).toBe('Hydration')
  })

  it('should update appearance', () => {
    const meter = Meter.create({
      name: 'Water',
      type: MeterType.Number,
      userId: 'usr-1',
      color: '#ffffff',
      icon: 'droplet',
    })
    meter.updateAppearance({ color: '#000000', icon: 'moon' })
    expect(meter.color).toBe('#000000')
    expect(meter.icon).toBe('moon')
  })

  it('should update goals', () => {
    const meter = Meter.create({
      name: 'Water',
      type: MeterType.Number,
      userId: 'usr-1',
      color: '#ffffff',
      icon: 'droplet',
    })
    meter.updateGoals({ dailyGoal: 8, weeklyGoal: 56 })
    expect(meter.dailyGoal).toBe(8)
    expect(meter.weeklyGoal).toBe(56)
  })

  it('should know if it is owned by a user', () => {
    const meter = Meter.create({
      name: 'Water',
      type: MeterType.Number,
      userId: 'usr-1',
      color: '#ffffff',
      icon: 'droplet',
    })
    expect(meter.isOwnedBy('usr-1')).toBe(true)
    expect(meter.isOwnedBy('usr-2')).toBe(false)
  })
})
