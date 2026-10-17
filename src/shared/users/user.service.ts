import { Injectable } from '@nestjs/common';
import { DocumentType, ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import { isValidObjectId } from 'mongoose';
import bcrypt from 'bcrypt';
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

const normalizeEmail = (email: string) => (email || '').trim().toLowerCase();

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
    const email = normalizeEmail(createUserDto.email);
    const { password } = createUserDto;
    if (!isValidEmail(email) || !password) {
      throw new MissingUserDataError('Insufficient user data');
    }
    if (await this.findOneByEmail(email)) {
      throw new UserAlreadyRegisteredError('User already registered');
    }
    const createdUser = new this.userModel({
      email,
      password: await bcrypt.hash(password, SALT_ROUNDS),
      roles: ['USER'],
    });
    await createdUser.save();
    return toUser(createdUser);
  }

  async findAll(): Promise<User[] | null> {
    const userDocs = await this.userModel.find().exec();
    return userDocs.map(toUser);
  }

  async findOneById(id: string): Promise<User | null> {
    if (!isValidObjectId(id)) {
      return null;
    }
    const userDoc = await this.userModel.findById(id).exec();
    if (!userDoc) {
      return null;
    }
    return toUser(userDoc);
  }

  async findOneByEmail(email: string): Promise<User | null> {
    const userDoc = await this.userModel
      .findOne({ email: normalizeEmail(email) })
      .exec();
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
    const userFromDb = await this.userModel.findOne({
      email: normalizeEmail(email),
    });
    if (!userFromDb) {
      throw new UserNotFoundError('User not found');
    }

    userFromDb.password = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await userFromDb.save();
    return true;
  }

  async checkPassword(email: string, password: string) {
    const user = await this.userModel.findOne({ email: normalizeEmail(email) });
    if (!user) {
      throw new UserNotFoundError('User not found');
    }

    return await bcrypt.compare(password, user.password);
  }
}
