import { Injectable } from '@nestjs/common'
import { QueryFailedError, Repository } from 'typeorm'
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError'
import { InjectRepository } from '@nestjs/typeorm'
import { UserNotFoundError } from './errors/user-not-found.error'
import { User, UserId } from './user'
import { UserAlreadyExistsError } from './errors/user-already-exists.error'

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async save(user: User): Promise<User> {
    try {
      return await this.userRepository.save(user)
    } catch (error) {
      if (error instanceof QueryFailedError) {
        if (error.driverError?.detail?.startsWith('Key (email)')) {
          throw new UserAlreadyExistsError(user.email)
        }
      }
      throw error
    }
  }

  async findOneByIdOrFail(id: UserId): Promise<User> {
    try {
      return await this.userRepository.findOneOrFail({ where: { id } })
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new UserNotFoundError()
      }
      throw error
    }
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } })
  }

  async findOneByEmailOrFail(email: string): Promise<User> {
    const user = await this.findOneByEmail(email)
    if (user) {
      return user
    }
    throw new UserNotFoundError()
  }
}
