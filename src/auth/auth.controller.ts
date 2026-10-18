import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { ThrottlerGuard } from '@nestjs/throttler';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../common/current-user.decorator.js';
import type { AuthUser } from '../common/current-user.decorator.js';
import { UsersService } from '../users/users.service.js';
import { UserDocument } from '../users/user.schema.js';
import { UserDto } from '../users/user.dto.js';
import { AuthService } from './auth.service.js';
import { AuthResultDto, LoginDto, SignUpDto } from './dto/credentials.dto.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly config: ConfigService,
  ) {}

  /** Log in with email and password. */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard, AuthGuard('local'))
  @ApiBody({ type: LoginDto })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password' })
  @ApiTooManyRequestsResponse({ description: 'Too many attempts' })
  login(@Req() req: Request): Promise<AuthResultDto> {
    return this.authService.login(req.user as UserDocument);
  }

  /** Create an account and log in. */
  @Post('signup')
  @UseGuards(ThrottlerGuard)
  @ApiConflictResponse({ description: 'User already exists' })
  @ApiForbiddenResponse({ description: 'Sign-up is disabled' })
  @ApiTooManyRequestsResponse({ description: 'Too many attempts' })
  signUp(@Body() dto: SignUpDto): Promise<AuthResultDto> {
    if (!this.config.get<boolean>('auth.signUp')) {
      throw new ForbiddenException('Sign-up is disabled.');
    }
    return this.authService.signUp(dto.email, dto.password);
  }

  /** The logged in user. */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async me(@CurrentUser() { userId }: AuthUser): Promise<UserDto> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException();
    }
    return UserDto.from(user);
  }
}
