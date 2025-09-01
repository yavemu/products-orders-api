import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { RepositoryUtil } from '../../common/utils';
import { UserMessages } from '../enums';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(userData: Partial<User>): Promise<any> {
    await RepositoryUtil.checkNotExists(
      () => this.findByWhereCondition({ email: userData.email }),
      UserMessages.ALREADY_EXISTS,
    );

    const user = new this.userModel(userData);
    return user.save();
  }

  async findByWhereCondition(
    whereCondition: Record<string, any> = {},
    options?: {
      page?: number;
      limit?: number;
      select?: string;
      multiple?: boolean;
    },
  ): Promise<any> {
    const { select = '-password', ...restOptions } = options || {};

    return RepositoryUtil.executeFindByWhereCondition(this.userModel, whereCondition, {
      ...restOptions,
      select,
    });
  }

  async updateById(id: string, updateData: Partial<User>): Promise<any> {
    RepositoryUtil.validateObjectId(id, UserMessages.INVALID_ID);
    await RepositoryUtil.checkExists(this.userModel, { _id: id }, UserMessages.NOT_FOUND);

    return this.userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .select('-password')
      .exec();
  }

  async deleteById(id: string): Promise<any> {
    RepositoryUtil.validateObjectId(id, UserMessages.INVALID_ID);
    await RepositoryUtil.checkExists(this.userModel, { _id: id }, UserMessages.NOT_FOUND);

    return this.userModel.findByIdAndDelete(id).select('-password').exec();
  }
}
