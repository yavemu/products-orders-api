import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Public } from '../../auth/decorators';
import { UsersService } from '../services/users.service';
import {
  CreateUserDto,
  SearchUserDto,
  UpdateUserDto,
  UserResponseDto,
  DeleteUserResponseDto,
} from '../dto';
import { PaginatedData } from '../../common/interfaces';
import {
  CreateUserDecorator,
  DeleteUserDecorator,
  FindAllUserDecorator,
  FindByIdUserDecorator,
  SearchUserDecorator,
  UpdateUserDecorator,
} from '../decorators';

@Controller('users')
@ApiTags('Usuarios')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Public()
  @CreateUserDecorator()
  create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @FindAllUserDecorator()
  findAll(): Promise<PaginatedData<UserResponseDto>> {
    return this.usersService.findAll();
  }

  @Post('search')
  @SearchUserDecorator()
  search(@Body() searchDto: SearchUserDto): Promise<PaginatedData<UserResponseDto>> {
    return this.usersService.search(searchDto);
  }

  @Get(':id')
  @FindByIdUserDecorator()
  findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.findOneById(id);
  }

  @Patch(':id')
  @UpdateUserDecorator()
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @DeleteUserDecorator()
  remove(@Param('id') id: string): Promise<DeleteUserResponseDto> {
    return this.usersService.remove(id);
  }
}
