import { Injectable } from '@nestjs/common';
import { CreateUserDto, SearchUserDto, UpdateUserDto } from '../dto';
import { UsersRepository } from '../repository/users.repository';
import { User } from '../schemas/user.schema';
import { ServiceUtil } from '../../common/utils';
import { PaginatedData } from '../../common/interfaces';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    return this.usersRepository.create(createUserDto);
  }

  async findAll(): Promise<PaginatedData<User>> {
    const users = (await this.usersRepository.findByWhereCondition(
      {},
      { multiple: true },
    )) as User[];
    return ServiceUtil.createListResponse(users);
  }

  async findOneById(id: string): Promise<User> {
    return this.usersRepository.findByWhereCondition({ _id: id }) as Promise<User>;
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByWhereCondition(
      { email },
      { select: '+password' },
    ) as Promise<User>;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    return this.usersRepository.updateById(id, updateUserDto);
  }

  async remove(id: string): Promise<User> {
    return this.usersRepository.deleteById(id);
  }

  async search(searchDto: SearchUserDto): Promise<PaginatedData<User>> {
    const page = searchDto.page || 1;
    const limit = searchDto.limit || 10;

    const filter = ServiceUtil.buildSearchFilter({
      firstName: searchDto.firstName,
      lastName: searchDto.lastName,
      email: searchDto.email,
    });

    const result = await this.usersRepository.findByWhereCondition(filter, { page, limit });
    return ServiceUtil.processPaginatedResult(result, (user: User) => user);
  }
}
