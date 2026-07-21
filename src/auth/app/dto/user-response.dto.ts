import { User } from '../../../users/domain/user'

export class UserResponseDto {
  id: string
  email: string
  displayName: string

  static fromDomain(user: User): UserResponseDto {
    const dto = new UserResponseDto()
    dto.id = user.id
    dto.email = user.email
    dto.displayName = user.displayName
    return dto
  }
}
