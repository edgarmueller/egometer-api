import { Injectable } from '@nestjs/common';
import { DocumentType, ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import bcrypt from 'bcrypt';
import has from 'lodash/has';
import { User } from './user';
import { CreateUserDto } from './dto/create-user.dto';
import { UserAlreadyRegisteredError } from './errors/user-already-registered.error';
import { MissingUserDataError } from './errors/missing-user-data.error';
import { UserNotFoundError } from './errors/user-not-found.error';

const SALT_ROUNDS = 10;

const toUser = (userDoc: DocumentType<User>) => ({
  id: userDoc._id,
  ...userDoc.toObject(),
});

const isValidEmail = (email: string) => {
  if (email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  } else {
    return false;
  }
};

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User) private readonly userModel: ReturnModelType<typeof User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password } = createUserDto;
    if (isValidEmail(email) && password) {
      const existingUser = await this.findOneByEmail(email);
      if (!existingUser) {
        const createdUser = new this.userModel({
          ...createUserDto,
          password: await bcrypt.hash(password, SALT_ROUNDS),
          roles: ['USER'],
        });
        await createdUser.save();
        return toUser(createdUser);
      } else if (!has(existingUser, 'auth.email.valid')) {
        return existingUser;
      } else {
        throw new UserAlreadyRegisteredError('User already registered');
      }
    } else {
      throw new MissingUserDataError('Insufficient user data');
    }
  }

  async findAll(): Promise<User[] | null> {
    const userDocs = await this.userModel.find().exec();
    return userDocs.map(toUser);
  }

  async findOneById(id: string): Promise<User> {
    const userDoc = await this.userModel.findById(id).exec();
    return toUser(userDoc);
  }

  async findOneByEmail(email: string): Promise<User | null> {
    const userDoc = await this.userModel.findOne({ email }).exec();
    if (!userDoc) {
      return null;
    }
    return toUser(userDoc);
  }

  async save(user: User): Promise<User> {
    const updatedDoc = await this.userModel.findOneAndUpdate(
      { _id: user.id },
      user,
    );
    return toUser(updatedDoc);
  }

  async setPassword(email: string, newPassword: string): Promise<boolean> {
    const userFromDb = await this.userModel.findOne({ email: email });
    if (!userFromDb) {
      throw new UserNotFoundError('User not found');
    }

    userFromDb.password = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await userFromDb.save();
    return true;
  }

  async checkPassword(email: string, password: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UserNotFoundError('User not found');
    }

    return await bcrypt.compare(password, user.password);
  }
}
