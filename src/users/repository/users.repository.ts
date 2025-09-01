import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { DatabaseUtil, RepositoryBaseUtil } from '../../common/utils';
import { UserMessages } from '../enums';
import { SearchUserDto, DeleteUserResponseDto } from '../dto';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(userData: Partial<User>): Promise<any> {
    this.validateUserData(userData, false);

    const existing = await this.findByWhereCondition({ email: userData.email });
    if (existing) {
      throw new BadRequestException(UserMessages.ALREADY_EXISTS);
    }

    const user = new this.userModel(userData);
    return user.save();
  }

  async findAll(): Promise<User[]> {
    return RepositoryBaseUtil.findAll(this.findByWhereCondition.bind(this));
  }

  async findOneById(id: string): Promise<User> {
    DatabaseUtil.validateObjectId(id, UserMessages.INVALID_ID);
    const user = await this.findByWhereCondition({ _id: id });

    if (!user) {
      throw new NotFoundException(UserMessages.NOT_FOUND);
    }

    return user;
  }

  async search(searchDto: SearchUserDto): Promise<any> {
    return RepositoryBaseUtil.search(
      searchDto,
      {
        firstName: searchDto.firstName,
        lastName: searchDto.lastName,
        email: searchDto.email,
      },
      this.findByWhereCondition.bind(this),
    );
  }

  async validateCredentials(email: string, password: string): Promise<User | null> {
    const user = (await this.findByWhereCondition({ email }, { select: '+password' })) as User;

    if (!user) {
      return null;
    }

    const userDoc = user as unknown as {
      comparePassword: (password: string) => Promise<boolean>;
    };
    const isPasswordValid = await userDoc.comparePassword(password);

    return isPasswordValid ? user : null;
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
    this.validateUserData(updateData, true);

    DatabaseUtil.validateObjectId(id, UserMessages.INVALID_ID);
    await DatabaseUtil.checkExists(this.userModel, { _id: id }, UserMessages.NOT_FOUND);

    return this.userModel.findByIdAndUpdate(id, updateData, { new: true }).select('-password').exec();
  }

  async deleteById(id: string): Promise<DeleteUserResponseDto> {
    DatabaseUtil.validateObjectId(id, UserMessages.INVALID_ID);
    await DatabaseUtil.checkExists(this.userModel, { _id: id }, UserMessages.NOT_FOUND);

    await this.userModel.findByIdAndDelete(id).exec();

    return {
      message: UserMessages.DELETED_SUCCESS,
    };
  }

  private validateUserData(userData: Partial<User>, isUpdate: boolean = false): void {
    if (userData.email && !this.isValidEmail(userData.email)) {
      throw new BadRequestException(UserMessages.INVALID_EMAIL);
    }

    if (userData.password && userData.password.length < 8) {
      throw new BadRequestException(UserMessages.PASSWORD_TOO_SHORT);
    }

    if (!isUpdate) {
      if (!userData.firstName?.trim()) {
        throw new BadRequestException(UserMessages.FIRST_NAME_REQUIRED);
      }

      if (!userData.lastName?.trim()) {
        throw new BadRequestException(UserMessages.LAST_NAME_REQUIRED);
      }

      if (!userData.email?.trim()) {
        throw new BadRequestException(UserMessages.EMAIL_REQUIRED);
      }

      if (!userData.password?.trim()) {
        throw new BadRequestException(UserMessages.PASSWORD_REQUIRED);
      }
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
