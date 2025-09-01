import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateUserDto,
  SearchUserDto,
  UpdateUserDto,
  UserResponseDto,
  DeleteUserResponseDto,
} from '../dto';
import { UsersRepository } from '../repository/users.repository';
import { User } from '../schemas/user.schema';
import { HttpResponseUtil } from '../../common/utils';
import { PaginatedData } from '../../common/interfaces';
import { UserMessages } from '../enums';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.usersRepository.create(createUserDto);
    return this.mapToDto(user);
  }

  async findAll(): Promise<PaginatedData<UserResponseDto>> {
    const users = (await this.usersRepository.findByWhereCondition(
      {},
      { multiple: true },
    )) as User[];
    const userDtos = users.map(user => this.mapToDto(user));
    return HttpResponseUtil.createListResponse(userDtos);
  }

  async findOneById(id: string): Promise<UserResponseDto> {
    const user = (await this.usersRepository.findByWhereCondition({ _id: id })) as User;
    if (!user) {
      throw new NotFoundException(UserMessages.NOT_FOUND);
    }
    return this.mapToDto(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.usersRepository.updateById(id, updateUserDto);
    return this.mapToDto(user);
  }

  async remove(id: string): Promise<DeleteUserResponseDto> {
    await this.usersRepository.deleteById(id);
    return {
      message: UserMessages.DELETED_SUCCESS,
    };
  }

  async search(searchDto: SearchUserDto): Promise<PaginatedData<UserResponseDto>> {
    const page = searchDto.page || 1;
    const limit = searchDto.limit || 10;

    const filter = HttpResponseUtil.buildSearchFilter({
      firstName: searchDto.firstName,
      lastName: searchDto.lastName,
      email: searchDto.email,
    });

    const result = await this.usersRepository.findByWhereCondition(filter, { page, limit });
    return HttpResponseUtil.processPaginatedResult(result, (user: User) => this.mapToDto(user));
  }

  // Usado para auth
  async validateCredentials(email: string, password: string): Promise<User | null> {
    const user = (await this.usersRepository.findByWhereCondition(
      { email },
      { select: '+password' },
    )) as Promise<User>;

    if (!user) {
      return null;
    }

    const userDoc = user as unknown as {
      comparePassword: (password: string) => Promise<boolean>;
    };
    const isPasswordValid = await userDoc.comparePassword(password);

    return isPasswordValid ? user : null;
  }

  // Usado para auth
  async createForAuth(createUserDto: CreateUserDto): Promise<User> {
    return this.usersRepository.create(createUserDto);
  }

  private mapToDto(user: User): UserResponseDto {
    return {
      _id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      fullName: `${user.firstName} ${user.lastName}`,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
