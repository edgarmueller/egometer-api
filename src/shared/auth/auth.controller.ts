import {
  Controller,
  UseGuards,
  Post,
  Body,
  Request,
  HttpCode,
  HttpStatus,
  Get,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService, AuthResult } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { GetUserDto } from '../users/dto/get-user.dto';
import { UserService } from '../users/user.service';
import { User } from '../users/user';
import { UserAlreadyRegisteredError } from '../users/errors/user-already-registered.error';
import { ContentType } from '../../common/guards/content-type.guard';
import { LocalAuthGuard } from '../../common/guards/local-auth.guard';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  @ApiOperation({ description: 'Log in with email and password' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Login successful' })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials',
  })
  @ApiBody({ type: LoginUserDto })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @UseGuards(ContentType('application/json'), LocalAuthGuard)
  async login(@Request() req): Promise<AuthResult> {
    return this.authService.login(req.user);
  }

  @ApiOperation({ description: 'Sign up a new user' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'User created' })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User already exists',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Sign-up is disabled',
  })
  @ApiBody({ type: CreateUserDto })
  @HttpCode(HttpStatus.CREATED)
  @Post('signup')
  @UseGuards(ContentType('application/json'))
  async signUp(@Body() createUserDto: CreateUserDto): Promise<AuthResult> {
    if (!this.configService.get<boolean>('features.signUp')) {
      throw new ForbiddenException('Sign-up is disabled.');
    }
    try {
      return await this.authService.signUp(createUserDto);
    } catch (error) {
      if (error instanceof UserAlreadyRegisteredError) {
        throw new ConflictException('User already exists.');
      }
      throw error;
    }
  }

  @ApiOperation({ description: 'Get the currently logged in user' })
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async me(@Request() req): Promise<GetUserDto> {
    const user = await this.userService.findOneById(req.user.sub);
    if (!user) {
      throw new NotFoundException();
    }
    return User.toDto(user);
  }
}
