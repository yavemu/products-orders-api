import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty, IsPositive, MinLength, MaxLength } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product name - unique identifier for the product',
    example: 'Laptop Gaming ASUS ROG',
    type: String,
    required: true,
    minLength: 3,
    maxLength: 100,
  })
  @IsString({ message: 'Product name must be a string' })
  @IsNotEmpty({ message: 'Product name is required' })
  @MinLength(3, { message: 'Product name must be at least 3 characters long' })
  @MaxLength(100, { message: 'Product name cannot exceed 100 characters' })
  name: string;

  @ApiProperty({
    description: 'Product SKU - Stock Keeping Unit, must be unique across all products',
    example: 'LP-ASUS-ROG-2024-001',
    type: String,
    required: true,
    minLength: 5,
    maxLength: 50,
    pattern: '^[A-Z0-9-]+$',
  })
  @IsString({ message: 'Product SKU must be a string' })
  @IsNotEmpty({ message: 'Product SKU is required' })
  @MinLength(5, { message: 'Product SKU must be at least 5 characters long' })
  @MaxLength(50, { message: 'Product SKU cannot exceed 50 characters' })
  sku: string;

  @ApiProperty({
    description: 'Product price in USD - must be a positive number with up to 2 decimal places',
    example: 1299.99,
    type: Number,
    required: true,
    minimum: 0.01,
    maximum: 999999.99,
  })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Price must be a number with up to 2 decimal places' })
  @IsNotEmpty({ message: 'Product price is required' })
  @IsPositive({ message: 'Product price must be a positive number' })
  price: number;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Product image file - supported formats: JPG, PNG, WEBP (max 5MB)',
    required: false,
  })
  picture?: any;
}
