import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { DatabaseUtil } from '../../common/utils';
import { UserMessages } from '../enums';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(userData: Partial<User>): Promise<any> {
    // Validar que el email tenga formato válido
    if (!this.isValidEmail(userData.email)) {
      throw new BadRequestException(UserMessages.INVALID_EMAIL);
    }

    // Validar longitud de contraseña
    if (userData.password && userData.password.length < 6) {
      throw new BadRequestException(UserMessages.PASSWORD_TOO_SHORT);
    }

    await DatabaseUtil.checkNotExists(
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

    return DatabaseUtil.executeFindByWhereCondition(this.userModel, whereCondition, {
      ...restOptions,
      select,
    });
  }

  async updateById(id: string, updateData: Partial<User>): Promise<any> {
    // Validar email si se está actualizando
    if (updateData.email && !this.isValidEmail(updateData.email)) {
      throw new BadRequestException(UserMessages.INVALID_EMAIL);
    }

    // Validar contraseña si se está actualizando
    if (updateData.password && updateData.password.length < 6) {
      throw new BadRequestException(UserMessages.PASSWORD_TOO_SHORT);
    }

    DatabaseUtil.validateObjectId(id, UserMessages.INVALID_ID);
    await DatabaseUtil.checkExists(this.userModel, { _id: id }, UserMessages.NOT_FOUND);

    return this.userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .select('-password')
      .exec();
  }

  async deleteById(id: string): Promise<any> {
    DatabaseUtil.validateObjectId(id, UserMessages.INVALID_ID);
    await DatabaseUtil.checkExists(this.userModel, { _id: id }, UserMessages.NOT_FOUND);

    return this.userModel.findByIdAndDelete(id).select('-password').exec();
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
