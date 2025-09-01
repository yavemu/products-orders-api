import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto, SearchUserDto, UpdateUserDto } from '../dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
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
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @CreateUserDecorator()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @FindAllUserDecorator()
  findAll() {
    return this.usersService.findAll();
  }

  @Post('search')
  @SearchUserDecorator()
  async search(@Body() searchDto: SearchUserDto) {
    return this.usersService.search(searchDto);
  }

  @Get(':id')
  @FindByIdUserDecorator()
  findOne(@Param('id') id: string) {
    return this.usersService.findOneById(id);
  }

  @Patch(':id')
  @UpdateUserDecorator()
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @DeleteUserDecorator()
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
