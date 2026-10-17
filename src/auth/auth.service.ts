import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service.js';
import { UserDocument } from '../users/user.schema.js';
import { UserDto } from '../users/user.dto.js';
import { AuthResultDto } from './dto/credentials.dto.js';
import { JwtPayload } from './jwt-payload.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async login(user: UserDocument): Promise<AuthResultDto> {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    return {
      token: await this.jwtService.signAsync(payload),
      user: UserDto.from(user),
    };
  }

  async signUp(email: string, password: string): Promise<AuthResultDto> {
    return this.login(await this.usersService.create(email, password));
  }
}
