import { Controller, Post, Body, Get, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { OrdersService } from '../services/orders.service';
import { CreateOrderDto, UpdateOrderDto, SearchOrderDto } from '../dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import {
  CreateOrderDecorator,
  FindAllOrderDecorator,
  FindByIdOrderDecorator,
  UpdateOrderDecorator,
  DeleteOrderDecorator,
  SearchOrderDecorator,
} from '../decorators';

@ApiTags('Órdenes')
@ApiBearerAuth('JWT-auth')
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @CreateOrderDecorator()
  async create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  @FindAllOrderDecorator()
  findAll() {
    return this.ordersService.findAll();
  }

  @Post('search')
  @SearchOrderDecorator()
  async search(@Body() searchDto: SearchOrderDto) {
    return this.ordersService.search(searchDto);
  }

  @Get(':id')
  @FindByIdOrderDecorator()
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  @UpdateOrderDecorator()
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Delete(':id')
  @DeleteOrderDecorator()
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}
