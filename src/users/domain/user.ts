import { AggregateRoot, Props, createId } from '../../shared/ddd'
import bcrypt from 'bcrypt'

const PREFIX = 'usr'
export type UserId = string
const createUserId = createId(PREFIX)

export class User extends AggregateRoot {
  email: string
  password: string
  displayName: string
  createdAt?: Date
  updatedAt?: Date

  public static create(props: Props<User>): User {
    return new User({
      ...props,
      id: props?.id || createUserId(),
    })
  }

  private constructor(props: Props<User>) {
    super({
      ...props,
      id: props?.id || createUserId(),
    })
  }

  updateDisplayName(displayName: string) {
    if (displayName) {
      this.displayName = displayName
    }
  }

  async setPassword(plainTextPassword: string) {
    this.password = await bcrypt.hash(plainTextPassword, 10)
  }

  async comparePassword(plainTextPassword: string): Promise<boolean> {
    return bcrypt.compare(plainTextPassword, this.password)
  }
}
