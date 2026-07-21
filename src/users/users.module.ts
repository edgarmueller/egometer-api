import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserRepository } from './domain/user.repository'
import { UserSchema } from './persistence/user.schema'

@Module({
  imports: [TypeOrmModule.forFeature([UserSchema])],
  providers: [UserRepository],
  exports: [UserRepository],
})
export class UsersModule {}
