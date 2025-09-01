import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class OrderProductResponseDto {
  @Expose()
  @ApiProperty({
    description: 'MongoDB ObjectId of the product in the order',
    example: '507f1f77bcf86cd799439011',
    type: String,
    format: 'ObjectId',
    readOnly: true,
  })
  productId: string;

  @Expose()
  @ApiProperty({
    description: 'Quantity of the product ordered',
    example: 2,
    type: Number,
    minimum: 1,
    maximum: 1000,
    readOnly: true,
  })
  quantity: number;

  @Expose()
  @ApiProperty({
    description: 'Product price at the time the order was created (frozen price)',
    example: 1299.99,
    type: Number,
    format: 'double',
    minimum: 0.01,
    maximum: 999999.99,
    readOnly: true,
  })
  price: number;

  @Expose()
  @ApiProperty({
    description: 'Product name at the time the order was created',
    example: 'Laptop Gaming ASUS ROG',
    type: String,
    minLength: 3,
    maxLength: 100,
    readOnly: true,
  })
  name: string;
}

export class OrderResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Unique MongoDB ObjectId for the order',
    example: '507f1f77bcf86cd799439011',
    type: String,
    format: 'ObjectId',
    readOnly: true,
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'Human-readable order identifier - auto-generated sequential number',
    example: 'ORD-2024-001',
    type: String,
    pattern: '^ORD-\\d{4}-\\d{3,}$',
    readOnly: true,
  })
  identifier: string;

  @Expose()
  @ApiProperty({
    description: 'MongoDB ObjectId of the client who placed the order',
    example: '507f1f77bcf86cd799439011',
    type: String,
    format: 'ObjectId',
    readOnly: true,
  })
  clientId: string;

  @Expose()
  @ApiProperty({
    description: 'Full name of the client who placed the order',
    example: 'John Doe Smith',
    type: String,
    minLength: 2,
    maxLength: 100,
    readOnly: true,
  })
  clientName: string;

  @Expose()
  @ApiProperty({
    description: 'Total order amount in USD calculated from all products (quantity × price)',
    example: 2599.98,
    type: Number,
    format: 'double',
    minimum: 0.01,
    readOnly: true,
  })
  total: number;

  @Expose()
  @ApiProperty({
    description: 'Total quantity of all products in the order',
    example: 5,
    type: Number,
    minimum: 1,
    readOnly: true,
  })
  totalQuantity: number;

  @Expose()
  @ApiProperty({
    description: 'Current status of the order',
    example: 'pending',
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
  })
  status: string;

  @Expose()
  @ApiProperty({
    description: 'Array of products included in this order with frozen prices and details',
    type: [OrderProductResponseDto],
    minItems: 1,
    maxItems: 50,
    readOnly: true,
  })
  products: OrderProductResponseDto[];

  @Expose()
  @ApiProperty({
    description: 'ISO 8601 datetime when the order was first created',
    example: '2024-08-29T10:30:45.123Z',
    type: String,
    format: 'date-time',
    readOnly: true,
  })
  createdAt: Date;

  @Expose()
  @ApiProperty({
    description: 'ISO 8601 datetime when the order was last updated',
    example: '2024-08-29T15:22:10.456Z',
    type: String,
    format: 'date-time',
    readOnly: true,
  })
  updatedAt: Date;
}
