import {
  Controller,
  UseGuards,
  Post,
  Body,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ContentType } from '../../common/guards/content-type.guard';
import { LocalAuthGuard } from '../../common/guards/local-auth.guard';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ description: 'Login with a user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Login successful' })
  @ApiBody({
    type: LoginUserDto,
    description: 'Payload for loggin in an user',
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @UseGuards(ContentType('application/json'))
  async login(@Request() req) {
    const { token, user } = await this.authService.login(req.user);
    return {
      token,
      user,
    };
  }

  @ApiOperation({ description: 'Sign up a new user' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'User created' })
  @ApiBody({
    type: CreateUserDto,
    description: 'Payload for creating an user',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('signup')
  @UseGuards(ContentType('application/json'))
  async signUp(@Body() user: CreateUserDto) {
    return await this.authService.create(user);
  }
}
