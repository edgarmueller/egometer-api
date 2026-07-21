import { EntitySchema } from 'typeorm'
import { Entry } from '../domain/entry'

export const EntrySchema = new EntitySchema<Entry>({
  target: Entry,
  name: 'Entry',
  tableName: 'entry',
  columns: {
    id: {
      type: String,
      primary: true,
    },
    date: {
      // stored as a plain YYYY-MM-DD date column, kept as an ISO date
      // string end-to-end (no timezone-aware Date object round-tripping)
      type: 'date',
      nullable: false,
      transformer: {
        to: (value: string) => value,
        from: (value: string) => value,
      },
    },
    meterId: {
      type: String,
      name: 'meter_id',
      nullable: false,
    },
    userId: {
      type: String,
      name: 'user_id',
      nullable: false,
    },
    value: {
      type: 'jsonb',
      nullable: false,
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
  uniques: [
    {
      name: 'uq_entry_meter_id_date',
      columns: ['meterId', 'date'],
    },
  ],
  indices: [
    {
      name: 'idx_entry_user_id_date',
      columns: ['userId', 'date'],
    },
  ],
})
