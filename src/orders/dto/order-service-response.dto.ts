import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderResponseDto } from './order-response.dto';

export class PaginatedOrderResponseDto {
  @ApiProperty({
    type: [OrderResponseDto],
    description: 'Lista de órdenes',
  })
  data: OrderResponseDto[];

  @ApiProperty({
    example: 1,
    description: 'Página actual',
  })
  page: number;

  @ApiProperty({
    example: 10,
    description: 'Cantidad de elementos por página',
  })
  limit: number;

  @ApiProperty({
    example: 100,
    description: 'Total de órdenes encontradas',
  })
  total: number;

  @ApiProperty({
    example: 10,
    description: 'Total de páginas disponibles',
  })
  totalPages: number;
}

export class OrderServiceResponseDto {
  @ApiProperty({
    example: true,
    description: 'Indica si la operación fue exitosa',
  })
  success: boolean;

  @ApiPropertyOptional({
    type: OrderResponseDto,
    description: 'Datos de la orden (si aplica)',
  })
  data?: OrderResponseDto;

  @ApiPropertyOptional({
    example: 'Orden creada exitosamente',
    description: 'Mensaje de éxito',
  })
  message?: string;

  @ApiPropertyOptional({
    example: 'Error al procesar la solicitud',
    description: 'Mensaje de error',
  })
  error?: string;
}

export class OrderListServiceResponseDto {
  @ApiProperty({
    example: true,
    description: 'Indica si la operación fue exitosa',
  })
  success: boolean;

  @ApiProperty({
    type: PaginatedOrderResponseDto,
    description: 'Datos paginados de órdenes',
  })
  data: any;

  @ApiProperty({
    example: 'Lista de órdenes obtenida exitosamente',
    description: 'Mensaje de éxito',
  })
  message?: string;
}

export class DeleteOrderResponseDto {
  @ApiProperty({ example: 'Orden eliminada exitosamente' })
  message: string;
}
