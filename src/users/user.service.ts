import { Injectable } from '@nestjs/common';
import { DocumentType, ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import { User } from './user';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User) private readonly userModel: ReturnModelType<typeof User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return await createdUser.save();
  }

  async findAll(): Promise<User[] | null> {
    return await this.userModel.find().exec();
  }

  async findOneById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    return user;
  }

  async findOneByEmail(email: string): Promise<DocumentType<User>> {
    return this.userModel.findOne({ email }).exec();
  }
}
