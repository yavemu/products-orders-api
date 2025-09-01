import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { CreateUserDto, SearchUserDto, UpdateUserDto } from '../dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOneById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    // Solo actualiza firstName y lastName
    return this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).exec();
  }

  async remove(id: string): Promise<User | null> {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  async search(searchDto: SearchUserDto): Promise<User[]> {
    const filter: any = {};

    if (searchDto.firstName) {
      filter.firstName = { $regex: searchDto.firstName, $options: 'i' };
    }
    if (searchDto.lastName) {
      filter.lastName = { $regex: searchDto.lastName, $options: 'i' };
    }
    if (searchDto.email) {
      filter.email = { $regex: searchDto.email, $options: 'i' };
    }

    return this.userModel.find(filter).exec();
  }
}
