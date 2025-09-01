import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiFile } from '../common/decorators/api-file.decorator';

@ApiTags('Products')
@ApiBearerAuth('JWT-auth')
@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new product',
    description:
      'Creates a new product with name, SKU, price and image. The product image is required and will be uploaded to the server.',
  })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    type: ProductResponseDto,
    schema: {
      example: {
        id: '507f1f77bcf86cd799439011',
        name: 'Laptop Gaming ASUS ROG',
        sku: 'LP-ASUS-ROG-2024-001',
        price: 1299.99,
        picture: '/uploads/products/507f1f77bcf86cd799439011-laptop.jpg',
        createdAt: '2024-08-29T10:30:45.123Z',
        updatedAt: '2024-08-29T10:30:45.123Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data or missing required fields',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'Product name must be at least 3 characters long',
          'Product SKU is required',
          'Price must be a positive number',
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
    status: 409,
    description: 'Conflict - Product with this SKU already exists',
    schema: {
      example: {
        statusCode: 409,
        message: 'Product with SKU LP-ASUS-ROG-2024-001 already exists',
        error: 'Conflict',
      },
    },
  })
  @ApiFile('picture')
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createProductDto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    if (!file) {
      throw new BadRequestException('Product picture is required');
    }

    const dtoWithPicture = {
      ...createProductDto,
      picture: file.path,
    };

    return this.productsService.create(dtoWithPicture);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get product by ID',
    description: 'Retrieves a single product by its MongoDB ObjectId',
  })
  @ApiResponse({
    status: 200,
    description: 'Product found successfully',
    type: ProductResponseDto,
    schema: {
      example: {
        id: '507f1f77bcf86cd799439011',
        name: 'Laptop Gaming ASUS ROG',
        sku: 'LP-ASUS-ROG-2024-001',
        price: 1299.99,
        picture: '/uploads/products/507f1f77bcf86cd799439011-laptop.jpg',
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
    description: 'Not Found - Product with the specified ID does not exist',
    schema: {
      example: {
        statusCode: 404,
        message: 'Product with ID 507f1f77bcf86cd799439011 not found',
        error: 'Not Found',
      },
    },
  })
  async findOne(@Param('id') id: string): Promise<ProductResponseDto> {
    return this.productsService.findOne(id);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all products',
    description: 'Retrieves a list of all products in the database',
  })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
    type: [ProductResponseDto],
    schema: {
      example: [
        {
          id: '507f1f77bcf86cd799439011',
          name: 'Laptop Gaming ASUS ROG',
          sku: 'LP-ASUS-ROG-2024-001',
          price: 1299.99,
          picture: '/uploads/products/507f1f77bcf86cd799439011-laptop.jpg',
          createdAt: '2024-08-29T10:30:45.123Z',
          updatedAt: '2024-08-29T10:30:45.123Z',
        },
        {
          id: '507f1f77bcf86cd799439012',
          name: 'Mouse Gaming Razer',
          sku: 'MS-RAZER-2024-002',
          price: 89.99,
          picture: '/uploads/products/507f1f77bcf86cd799439012-mouse.jpg',
          createdAt: '2024-08-29T11:15:30.456Z',
          updatedAt: '2024-08-29T11:15:30.456Z',
        },
      ],
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
  async findAll(): Promise<ProductResponseDto[]> {
    return this.productsService.findAll();
  }
}
