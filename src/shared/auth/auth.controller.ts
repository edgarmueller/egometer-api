import {
  Controller,
  UseGuards,
  Post,
  Body,
  Request,
  HttpCode,
  HttpStatus,
  Get,
  BadRequestException,
  Param,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserService } from '../users/user.service';
import { ContentType } from '../../common/guards/content-type.guard';
import { LocalAuthGuard } from '../../common/guards/local-auth.guard';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from '../users/user';
import { EmailVerificationService } from './email-verification/email-verification.service';
import { ResetPasswordEmailRecentlySentError } from './errors/reset-password-email-recently-sent.error';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgottenPasswordService } from './forgotten-password/forgotten-password.service';
import { UserAlreadyRegisteredError } from '../users/errors/user-already-registered.error';
import { LoginEmailRecentlySentError } from './email-verification/errors/login-email-recently-sent.error';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly forgottenPasswordService: ForgottenPasswordService,
  ) {}

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
    try {
      const newUser = await this.userService.create(user);
      const sent = await this.emailVerificationService.sendEmailVerification(
        newUser.email,
      );
      if (!sent) {
        throw new BadRequestException('signup.error.mail-not-sent');
      } else {
        await this.authService.saveUserConsent(newUser.email);
        return User.toDto(newUser);
      }
    } catch (error) {
      if (error instanceof UserAlreadyRegisteredError) {
        throw new BadRequestException(error.message);
      }
    }
  }

  @Get('email/verify/:token')
  public async verifyAccountByEmail(@Param() params): Promise<boolean> {
    try {
      await this.emailVerificationService.verifyEmail(params.token);
      return true;
      //return new ResponseSuccess('LOGIN.EMAIL_VERIFIED', isEmailVerified);
    } catch (error) {
      console.log(error);
      return false;
      //return new ResponseError('LOGIN.ERROR', error);
    }
  }

  @Get('forgot-password/verify/:token')
  public async verifyIsPasswordResetLegit(@Param() params): Promise<boolean> {
    try {
      await this.forgottenPasswordService.findOneByToken(params.token);
      return true;
      //return new ResponseSuccess('LOGIN.EMAIL_VERIFIED', isEmailVerified);
    } catch (error) {
      console.log(error);
      return false;
      //return new ResponseError('LOGIN.ERROR', error);
    }
  }

  @Get('resend-verification/:email')
  public async sendEmailVerification(@Param() params): Promise<any> {
    try {
      const isEmailSent = await this.emailVerificationService.sendEmailVerification(
        params.email,
      );
      if (!isEmailSent) {
        throw new LoginEmailRecentlySentError('Mail already has been sent.');
      }
    } catch (error) {
      return new Error('LOGIN.ERROR.SEND_EMAIL');
    }
  }

  @Post('forgot-password')
  public async sendEmailForgotPassword(@Body() { email }): Promise<any> {
    try {
      const isEmailSent = await this.authService.sendEmailForgotPassword(email);
      if (!isEmailSent) {
        throw new Error("Forgot password hasn't been sent");
      }
    } catch (error) {
      if (error instanceof ResetPasswordEmailRecentlySentError) {
        throw new BadRequestException(error.message);
      }
    }
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  public async setNewPassord(
    @Body() resetPassword: ResetPasswordDto,
  ): Promise<any> {
    try {
      const validRequest = await this.forgottenPasswordService.findOneByToken(
        resetPassword.newPasswordToken,
      );
      let isNewPasswordChanged = false;
      // TODO
      if (
        !validRequest &&
        resetPassword.email &&
        resetPassword.currentPassword
      ) {
        const isValidPassword = await this.userService.checkPassword(
          validRequest.email,
          resetPassword.currentPassword,
        );
        if (isValidPassword) {
          isNewPasswordChanged = await this.userService.setPassword(
            validRequest.email,
            resetPassword.newPassword,
          );
        } else {
          throw new BadRequestException('Current password is incorrect');
        }
      } else if (validRequest && resetPassword.newPasswordToken) {
        const forgottenPasswordModel = await this.forgottenPasswordService.findOneByToken(
          resetPassword.newPasswordToken,
        );
        isNewPasswordChanged = await this.userService.setPassword(
          forgottenPasswordModel.email,
          resetPassword.newPassword,
        );
        if (isNewPasswordChanged) {
          this.forgottenPasswordService.removeById(forgottenPasswordModel.id);
        }
      } else {
        return new Error('RESET_PASSWORD.CHANGE_PASSWORD_ERROR');
      }
    } catch (error) {
      // TODO
      console.log(error);
      return new Error(`RESET_PASSWORD.CHANGE_PASSWORD_ERROR: ${error}`);
    }
  }
}
