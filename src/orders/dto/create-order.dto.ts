import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, IsNotEmpty, ValidateNested, MinLength, MaxLength, IsPositive, Min, Max, ArrayMinSize, ArrayMaxSize, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderProductDto {
  @ApiProperty({
    description: 'MongoDB ObjectId of the product to include in the order',
    example: '507f1f77bcf86cd799439011',
    type: String,
    format: 'ObjectId',
    required: true,
  })
  @IsString({ message: 'Product ID must be a string' })
  @IsNotEmpty({ message: 'Product ID is required' })
  @IsMongoId({ message: 'Product ID must be a valid MongoDB ObjectId' })
  productId: string;

  @ApiProperty({
    description: 'Quantity of the product to order - must be a positive integer',
    example: 2,
    type: Number,
    required: true,
    minimum: 1,
    maximum: 1000,
  })
  @IsNumber({}, { message: 'Quantity must be a number' })
  @IsNotEmpty({ message: 'Quantity is required' })
  @IsPositive({ message: 'Quantity must be a positive number' })
  @Min(1, { message: 'Minimum quantity is 1' })
  @Max(1000, { message: 'Maximum quantity is 1000' })
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'Full name of the client placing the order',
    example: 'John Doe Smith',
    type: String,
    required: true,
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'Client name must be a string' })
  @IsNotEmpty({ message: 'Client name is required' })
  @MinLength(2, { message: 'Client name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Client name cannot exceed 100 characters' })
  clientName: string;

  @ApiProperty({
    description: 'Array of products to include in the order - minimum 1, maximum 50 products',
    type: [OrderProductDto],
    required: true,
    minItems: 1,
    maxItems: 50,
  })
  @IsArray({ message: 'Products must be an array' })
  @ArrayMinSize(1, { message: 'At least one product is required' })
  @ArrayMaxSize(50, { message: 'Maximum 50 products allowed per order' })
  @ValidateNested({ each: true })
  @Type(() => OrderProductDto)
  products: OrderProductDto[];
}
