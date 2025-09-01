import { Controller, Post, Body, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UseInterceptors } from '@nestjs/common';

@ApiTags('Orders')
@ApiBearerAuth('JWT-auth')
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new order',
    description:
      'Creates a new order with client name and products. Validates that all products exist and calculates total automatically.',
  })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
    type: OrderResponseDto,
    schema: {
      example: {
        id: '507f1f77bcf86cd799439011',
        identifier: 'ORD-2024-001',
        clientName: 'John Doe Smith',
        total: 2599.98,
        status: 'pending',
        products: [
          {
            productId: '507f1f77bcf86cd799439011',
            quantity: 2,
            price: 1299.99,
            name: 'Laptop Gaming ASUS ROG',
          },
        ],
        createdAt: '2024-08-29T10:30:45.123Z',
        updatedAt: '2024-08-29T10:30:45.123Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data or validation errors',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'Client name must be at least 2 characters long',
          'At least one product is required',
          'Product ID must be a valid MongoDB ObjectId',
        ],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - One or more products in the order do not exist',
    schema: {
      example: {
        statusCode: 404,
        message: 'Product with ID 507f1f77bcf86cd799439011 not found',
        error: 'Not Found',
      },
    },
  })
  async create(@Body() createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    return this.ordersService.create(createOrderDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get order by ID',
    description: 'Retrieves a single order by its MongoDB ObjectId with all product details',
  })
  @ApiResponse({
    status: 200,
    description: 'Order found successfully',
    type: OrderResponseDto,
    schema: {
      example: {
        id: '507f1f77bcf86cd799439011',
        identifier: 'ORD-2024-001',
        clientName: 'John Doe Smith',
        total: 2599.98,
        status: 'pending',
        products: [
          {
            productId: '507f1f77bcf86cd799439011',
            quantity: 2,
            price: 1299.99,
            name: 'Laptop Gaming ASUS ROG',
          },
        ],
        createdAt: '2024-08-29T10:30:45.123Z',
        updatedAt: '2024-08-29T10:30:45.123Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid ObjectId format',
    schema: {
      example: {
        statusCode: 400,
        message: 'Invalid ObjectId format',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Order with the specified ID does not exist',
    schema: {
      example: {
        statusCode: 404,
        message: 'Order with ID 507f1f77bcf86cd799439011 not found',
        error: 'Not Found',
      },
    },
  })
  async findOne(@Param('id') id: string): Promise<OrderResponseDto> {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update an order',
    description:
      'Updates an existing order. Can modify client name, products, or order status. All fields are optional.',
  })
  @ApiResponse({
    status: 200,
    description: 'Order updated successfully',
    type: OrderResponseDto,
    schema: {
      example: {
        id: '507f1f77bcf86cd799439011',
        identifier: 'ORD-2024-001',
        clientName: 'John Doe Smith',
        total: 2599.98,
        status: 'processing',
        products: [
          {
            productId: '507f1f77bcf86cd799439011',
            quantity: 2,
            price: 1299.99,
            name: 'Laptop Gaming ASUS ROG',
          },
        ],
        createdAt: '2024-08-29T10:30:45.123Z',
        updatedAt: '2024-08-29T15:22:10.456Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data or validation errors',
    schema: {
      example: {
        statusCode: 400,
        message: ['Status must be one of: pending, processing, shipped, delivered, cancelled'],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Order or one of the products does not exist',
    schema: {
      example: {
        statusCode: 404,
        message: 'Order with ID 507f1f77bcf86cd799439011 not found',
        error: 'Not Found',
      },
    },
  })
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<OrderResponseDto> {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Get('stats/last-month')
  @ApiOperation({
    summary: 'Get total sales for last month',
    description: 'Calculates and returns the total amount of all orders placed in the last 30 days',
  })
  @ApiResponse({
    status: 200,
    description: 'Last month total sales retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        total: {
          type: 'number',
          description: 'Total sales amount in USD for the last 30 days',
          example: 15000.5,
          format: 'double',
          minimum: 0,
        },
      },
      example: {
        total: 15000.5,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  async getLastMonthTotal(): Promise<{ total: number }> {
    const total = await this.ordersService.getLastMonthTotal();
    return { total };
  }

  @Get('stats/highest')
  @ApiOperation({
    summary: 'Get highest value order',
    description:
      'Retrieves the order with the highest total amount from all orders in the database',
  })
  @ApiResponse({
    status: 200,
    description: 'Highest value order found successfully',
    type: OrderResponseDto,
    schema: {
      example: {
        id: '507f1f77bcf86cd799439011',
        identifier: 'ORD-2024-001',
        clientName: 'John Doe Smith',
        total: 25999.98,
        status: 'delivered',
        products: [
          {
            productId: '507f1f77bcf86cd799439011',
            quantity: 20,
            price: 1299.99,
            name: 'Laptop Gaming ASUS ROG',
          },
        ],
        createdAt: '2024-08-29T10:30:45.123Z',
        updatedAt: '2024-08-29T15:22:10.456Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - No orders exist in the database',
    schema: {
      example: {
        statusCode: 404,
        message: 'No orders found in the database',
        error: 'Not Found',
      },
    },
  })
  async getHighestOrder(): Promise<OrderResponseDto> {
    return this.ordersService.getHighestOrder();
  }
}
