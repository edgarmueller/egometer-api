import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, mongo } from 'mongoose';
import bcrypt from 'bcrypt';
import { User, UserDocument } from './user.schema.js';

const SALT_ROUNDS = 10;

const normalizeEmail = (email: string) => email.trim().toLowerCase();

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async create(email: string, password: string): Promise<UserDocument> {
    try {
      return await this.userModel.create({
        email: normalizeEmail(email),
        passwordHash: await bcrypt.hash(password, SALT_ROUNDS),
      });
    } catch (error) {
      // the unique index also catches concurrent sign-ups with the same email
      if (error instanceof mongo.MongoServerError && error.code === 11000) {
        throw new ConflictException('User already exists.');
      }
      throw error;
    }
  }

  findById(id: string): Promise<UserDocument | null> {
    if (!isValidObjectId(id)) {
      return Promise.resolve(null);
    }
    return this.userModel.findById(id).exec();
  }

  findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: normalizeEmail(email) }).exec();
  }

  /** Returns the user if the password matches, otherwise null. */
  async verifyPassword(
    email: string,
    password: string,
  ): Promise<UserDocument | null> {
    const user = await this.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return null;
    }
    return user;
  }
}
