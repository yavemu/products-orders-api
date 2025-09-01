import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CsvResponseInterceptor } from '../../common/interceptors';
import { OrdersService } from '../services/orders.service';
import {
  CreateOrderDto,
  UpdateOrderDto,
  SearchOrderDto,
  OrderReportsDto,
  OrderResponseDto,
  OrderReportsResponseDto,
  DeleteOrderResponseDto,
} from '../dto';
import { PaginatedData } from '../../common/interfaces';
import {
  CreateOrderDecorator,
  FindAllOrderDecorator,
  FindByIdOrderDecorator,
  UpdateOrderDecorator,
  DeleteOrderDecorator,
  SearchOrderDecorator,
  OrderReportsDecorator,
} from '../decorators';

@ApiTags('Órdenes')
@ApiBearerAuth('JWT-auth')
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @CreateOrderDecorator()
  create(@Body() createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  @FindAllOrderDecorator()
  findAll(): Promise<PaginatedData<OrderResponseDto>> {
    return this.ordersService.findAll();
  }

  @Post('search')
  @SearchOrderDecorator()
  search(@Body() searchDto: SearchOrderDto): Promise<PaginatedData<OrderResponseDto>> {
    return this.ordersService.search(searchDto);
  }

  @Get(':id')
  @FindByIdOrderDecorator()
  findOne(@Param('id') id: string): Promise<OrderResponseDto> {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  @UpdateOrderDecorator()
  update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<OrderResponseDto> {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Delete(':id')
  @DeleteOrderDecorator()
  remove(@Param('id') id: string): Promise<DeleteOrderResponseDto> {
    return this.ordersService.remove(id);
  }

  @Post('reports')
  @UseInterceptors(CsvResponseInterceptor)
  @OrderReportsDecorator()
  generateReports(
    @Body() reportsDto: OrderReportsDto,
  ): Promise<OrderReportsResponseDto | { csvContent: string; headers: Record<string, string> }> {
    return this.ordersService.generateReports(reportsDto);
  }
}
