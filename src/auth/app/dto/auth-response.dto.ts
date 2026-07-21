import { AuthResult } from '../auth.usecases'
import { UserResponseDto } from './user-response.dto'

export class AuthResponseDto {
  accessToken: string
  user: UserResponseDto

  static fromResult(result: AuthResult): AuthResponseDto {
    const dto = new AuthResponseDto()
    dto.accessToken = result.accessToken
    dto.user = UserResponseDto.fromDomain(result.user)
    return dto
  }
}
