import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ProductResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Unique MongoDB ObjectId for the product',
    example: '507f1f77bcf86cd799439011',
    type: String,
    format: 'ObjectId',
    readOnly: true,
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'Product name as stored in the database',
    example: 'Laptop Gaming ASUS ROG',
    type: String,
    minLength: 3,
    maxLength: 100,
  })
  name: string;

  @Expose()
  @ApiProperty({
    description: 'Product SKU (Stock Keeping Unit) - unique identifier',
    example: 'LP-ASUS-ROG-2024-001',
    type: String,
    minLength: 5,
    maxLength: 50,
    pattern: '^[A-Z0-9-]+$',
  })
  sku: string;

  @Expose()
  @ApiProperty({
    description: 'Product price in USD with up to 2 decimal places',
    example: 1299.99,
    type: Number,
    format: 'double',
    minimum: 0.01,
    maximum: 999999.99,
  })
  price: number;

  @Expose()
  @ApiProperty({
    description: 'Relative URL path to the product image file, null if no image uploaded',
    example: '/uploads/products/507f1f77bcf86cd799439011-laptop.jpg',
    type: String,
    nullable: true,
    format: 'uri-reference',
  })
  picture: string | null;

  @Expose()
  @ApiProperty({
    description: 'ISO 8601 datetime when the product was first created',
    example: '2024-08-29T10:30:45.123Z',
    type: String,
    format: 'date-time',
    readOnly: true,
  })
  createdAt: Date;

  @Expose()
  @ApiProperty({
    description: 'ISO 8601 datetime when the product was last updated',
    example: '2024-08-29T15:22:10.456Z',
    type: String,
    format: 'date-time',
    readOnly: true,
  })
  updatedAt: Date;
}
