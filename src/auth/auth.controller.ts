import {
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { AuthUsecases } from './app/auth.usecases'
import { RegisterDto } from './app/dto/register.dto'
import { AuthResponseDto } from './app/dto/auth-response.dto'
import { UserResponseDto } from './app/dto/user-response.dto'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { LocalAuthGuard } from './guards/local-auth.guard'
import { RequestWithUser } from './interfaces/request-with-user.interface'
import { UserAlreadyExistsError } from '../users/domain/errors/user-already-exists.error'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly usecases: AuthUsecases) {}

  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    try {
      const result = await this.usecases.register(dto)
      return AuthResponseDto.fromResult(result)
    } catch (error) {
      if (error instanceof UserAlreadyExistsError) {
        throw new ConflictException(error.message)
      }
      throw error
    }
  }

  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() request: RequestWithUser): Promise<AuthResponseDto> {
    const result = await this.usecases.login(request.user)
    return AuthResponseDto.fromResult(result)
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() request: RequestWithUser): Promise<UserResponseDto> {
    const user = await this.usecases.getMe(request.user.id)
    return UserResponseDto.fromDomain(user)
  }
}
