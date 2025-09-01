import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateOrderDto } from './create-order.dto';
import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @ApiPropertyOptional({
    description: 'Estado de la orden - puede actualizarse para rastrear el progreso',
    example: 'processing',
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'El estado debe ser una cadena de texto' })
  @IsIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'], {
    message: 'El estado debe ser uno de: pending, processing, shipped, delivered, cancelled',
  })
  status?: string;
}
