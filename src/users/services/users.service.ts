import { Injectable } from '@nestjs/common';
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

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.usersRepository.create(createUserDto);
    return this.mapToDto(user);
  }

  async findAll(): Promise<PaginatedData<UserResponseDto>> {
    const users = await this.usersRepository.findAll();
    const userDtos = users.map(user => this.mapToDto(user));
    return HttpResponseUtil.createListResponse(userDtos);
  }

  async findOneById(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOneById(id);
    return this.mapToDto(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.usersRepository.updateById(id, updateUserDto);
    return this.mapToDto(user);
  }

  async remove(id: string): Promise<DeleteUserResponseDto> {
    return this.usersRepository.deleteById(id);
  }

  async search(searchDto: SearchUserDto): Promise<PaginatedData<UserResponseDto>> {
    const result = await this.usersRepository.search(searchDto);
    return HttpResponseUtil.processPaginatedResult(result, (user: User) => this.mapToDto(user));
  }

  async validateCredentials(email: string, password: string): Promise<User | null> {
    return this.usersRepository.validateCredentials(email, password);
  }

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
