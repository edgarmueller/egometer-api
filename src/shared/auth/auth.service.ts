import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/user.service';
import { User } from '../users/user';
import { GetUserDto } from '../users/dto/get-user.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { JwtPayload } from './jwt-payload';

export interface AuthResult {
  token: string;
  user: GetUserDto;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findOneByEmail(email);
    if (!user || !(await this.userService.checkPassword(email, password))) {
      return null;
    }
    return user;
  }

  async login(user: User): Promise<AuthResult> {
    const payload: JwtPayload = { sub: String(user.id), email: user.email };
    return {
      token: await this.jwtService.signAsync(payload),
      user: User.toDto(user),
    };
  }

  async signUp(createUserDto: CreateUserDto): Promise<AuthResult> {
    const user = await this.userService.create(createUserDto);
    return this.login(user);
  }
}
