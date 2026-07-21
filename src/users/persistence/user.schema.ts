import { EntitySchema } from 'typeorm'
import { User } from '../domain/user'

export const UserSchema = new EntitySchema<User>({
  target: User,
  name: 'User',
  tableName: 'user',
  columns: {
    id: {
      type: String,
      primary: true,
    },
    email: {
      type: String,
      unique: true,
      nullable: false,
      name: 'email',
    },
    password: {
      type: String,
      unique: false,
      nullable: false,
      name: 'password',
    },
    displayName: {
      type: String,
      unique: false,
      nullable: false,
      name: 'display_name',
    },
    createdAt: {
      type: Date,
      unique: false,
      nullable: false,
      name: 'created_at',
      createDate: true,
    },
    updatedAt: {
      type: Date,
      unique: false,
      nullable: false,
      name: 'updated_at',
      updateDate: true,
    },
  },
})
