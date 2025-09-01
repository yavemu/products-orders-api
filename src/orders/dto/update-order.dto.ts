import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateOrderDto } from './create-order.dto';
import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @ApiProperty({
    description: 'Order status - can be updated to track order progress',
    example: 'completed',
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Status must be a string' })
  @IsIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'], {
    message: 'Status must be one of: pending, processing, shipped, delivered, cancelled'
  })
  status?: string;
}
