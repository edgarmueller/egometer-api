import { EntitySchema } from 'typeorm'
import { Meter } from '../domain/meter'
import { MeterType } from '../domain/meter-type'

export const MeterSchema = new EntitySchema<Meter>({
  target: Meter,
  name: 'Meter',
  tableName: 'meter',
  columns: {
    id: {
      type: String,
      primary: true,
    },
    name: {
      type: String,
      unique: false,
      nullable: false,
    },
    type: {
      type: 'enum',
      enum: MeterType,
      enumName: 'meter_type_enum',
      nullable: false,
    },
    userId: {
      type: String,
      name: 'user_id',
      nullable: false,
    },
    color: {
      type: String,
      unique: false,
      nullable: false,
    },
    icon: {
      type: String,
      unique: false,
      nullable: false,
    },
    dailyGoal: {
      type: Number,
      name: 'daily_goal',
      nullable: true,
    },
    weeklyGoal: {
      type: Number,
      name: 'weekly_goal',
      nullable: true,
    },
    sortOrder: {
      type: Number,
      name: 'sort_order',
      nullable: false,
      default: 0,
    },
    createdAt: {
      type: Date,
      name: 'created_at',
      nullable: false,
      createDate: true,
    },
    updatedAt: {
      type: Date,
      name: 'updated_at',
      nullable: false,
      updateDate: true,
    },
  },
})
