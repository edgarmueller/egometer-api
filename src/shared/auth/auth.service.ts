import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { UserService } from '../../users/user.service';
import { User } from '../../users/user';
import { GetUserDto } from '../../users/dto/get-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<GetUserDto> {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      return null;
    }

    // find if user password match
    const match = await this.comparePassword(pass, user.password);
    if (!match) {
      return null;
    }

    // tslint:disable-next-line: no-string-literal
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return User.toDto(user);
  }

  public async login(user) {
    const token = await this.generateToken(user);
    return { user, token };
  }

  public async create(user) {
    // hash the password
    const pass = await this.hashPassword(user.password);

    // create the user
    const newUser = await this.userService.create({ ...user, password: pass });
    // tslint:disable-next-line: no-string-literal
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { email, roles } = newUser;
    const dto = {
      email,
      roles,
      id: newUser['_id'],
    };
    // generate token
    const token = await this.generateToken(dto);

    // return the user and the token
    return { user: dto, token };
  }

  private async generateToken(user) {
    const token = await this.jwtService.signAsync(user, { expiresIn: '1d' });
    return token;
  }

  private async hashPassword(password) {
    const hash = await bcrypt.hash(password, 10);
    return hash;
  }

  private async comparePassword(enteredPassword, dbPassword) {
    const match = await bcrypt.compare(enteredPassword, dbPassword);
    return match;
  }
}
