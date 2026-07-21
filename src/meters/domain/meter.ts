import { AggregateRoot, Props, createId } from '../../shared/ddd'
import { MeterType } from './meter-type'

const PREFIX = 'mtr'
export type MeterId = string
const createMeterId = createId(PREFIX)

export class Meter extends AggregateRoot {
  name: string
  type: MeterType
  userId: string
  color: string
  icon: string
  dailyGoal?: number
  weeklyGoal?: number
  sortOrder: number
  createdAt?: Date
  updatedAt?: Date

  public static create(
    props: Omit<Props<Meter>, 'sortOrder'> & { sortOrder?: number },
  ): Meter {
    return new Meter({
      ...props,
      sortOrder: props?.sortOrder ?? 0,
      id: props?.id || createMeterId(),
    })
  }

  private constructor(props: Props<Meter>) {
    super({
      ...props,
      id: props?.id || createMeterId(),
    })
  }

  rename(name?: string) {
    if (name) {
      this.name = name
    }
  }

  updateAppearance(input: { color?: string; icon?: string }) {
    if (input.color) {
      this.color = input.color
    }
    if (input.icon) {
      this.icon = input.icon
    }
  }

  updateGoals(input: { dailyGoal?: number; weeklyGoal?: number }) {
    if (input.dailyGoal !== undefined) {
      this.dailyGoal = input.dailyGoal
    }
    if (input.weeklyGoal !== undefined) {
      this.weeklyGoal = input.weeklyGoal
    }
  }

  updateSortOrder(sortOrder: number) {
    if (sortOrder !== undefined) {
      this.sortOrder = sortOrder
    }
  }

  isOwnedBy(userId: string): boolean {
    return this.userId === userId
  }
}
