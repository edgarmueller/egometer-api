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

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
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
    const newUser = await this.userService.create(user);
    const sent = await this.authService.sendEmailVerification(newUser.email);
    if (!sent) {
      throw new BadRequestException('signup.error.mail-not-sent');
    } else {
      await this.authService.createEmailToken(newUser.email);
      await this.authService.saveUserConsent(newUser.email);
      return User.toDto(newUser);
    }
  }

  @Get('email/verify/:token')
  public async verifyEmail(@Param() params): Promise<boolean> {
    try {
      await this.authService.verifyEmail(params.token);
      return true;
      //return new ResponseSuccess('LOGIN.EMAIL_VERIFIED', isEmailVerified);
    } catch (error) {
      console.log(error);
      return false;
      //return new ResponseError('LOGIN.ERROR', error);
    }
  }

  //@Get('email/resend-verification/:email')
  //public async sendEmailVerification(@Param() params): Promise<IResponse> {
  //  try {
  //    await this.authService.createEmailToken(params.email);
  //    var isEmailSent = await this.authService.sendEmailVerification(
  //      params.email,
  //    );
  //    if (isEmailSent) {
  //      return new ResponseSuccess('LOGIN.EMAIL_RESENT', null);
  //    } else {
  //      return new ResponseError('REGISTRATION.ERROR.MAIL_NOT_SENT');
  //    }
  //  } catch (error) {
  //    return new ResponseError('LOGIN.ERROR.SEND_EMAIL', error);
  //  }
  //}

  //@Get('email/forgot-password/:email')
  //public async sendEmailForgotPassword(@Param() params): Promise<IResponse> {
  //  try {
  //    var isEmailSent = await this.authService.sendEmailForgotPassword(
  //      params.email,
  //    );
  //    if (isEmailSent) {
  //      return new ResponseSuccess('LOGIN.EMAIL_RESENT', null);
  //    } else {
  //      return new ResponseError('REGISTRATION.ERROR.MAIL_NOT_SENT');
  //    }
  //  } catch (error) {
  //    return new ResponseError('LOGIN.ERROR.SEND_EMAIL', error);
  //  }
  //}

  //@Post('email/reset-password')
  //@HttpCode(HttpStatus.OK)
  //public async setNewPassord(
  //  @Body() resetPassword: ResetPasswordDto,
  //): Promise<IResponse> {
  //  try {
  //    var isNewPasswordChanged: boolean = false;
  //    if (resetPassword.email && resetPassword.currentPassword) {
  //      var isValidPassword = await this.authService.checkPassword(
  //        resetPassword.email,
  //        resetPassword.currentPassword,
  //      );
  //      if (isValidPassword) {
  //        isNewPasswordChanged = await this.userService.setPassword(
  //          resetPassword.email,
  //          resetPassword.newPassword,
  //        );
  //      } else {
  //        return new ResponseError('RESET_PASSWORD.WRONG_CURRENT_PASSWORD');
  //      }
  //    } else if (resetPassword.newPasswordToken) {
  //      var forgottenPasswordModel = await this.authService.getForgottenPasswordModel(
  //        resetPassword.newPasswordToken,
  //      );
  //      isNewPasswordChanged = await this.userService.setPassword(
  //        forgottenPasswordModel.email,
  //        resetPassword.newPassword,
  //      );
  //      if (isNewPasswordChanged) await forgottenPasswordModel.remove();
  //    } else {
  //      return new ResponseError('RESET_PASSWORD.CHANGE_PASSWORD_ERROR');
  //    }
  //    return new ResponseSuccess(
  //      'RESET_PASSWORD.PASSWORD_CHANGED',
  //      isNewPasswordChanged,
  //    );
  //  } catch (error) {
  //    return new ResponseError('RESET_PASSWORD.CHANGE_PASSWORD_ERROR', error);
  //  }
  //}
}
