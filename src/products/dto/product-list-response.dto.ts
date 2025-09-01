import { ApiProperty } from '@nestjs/swagger';
import { ProductResponseDto } from './product-response.dto';

export class PaginatedProductResponseDto {
  @ApiProperty({
    type: [ProductResponseDto],
    description: 'Lista de productos',
  })
  data: ProductResponseDto[];

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
    description: 'Total de productos encontrados',
  })
  total: number;

  @ApiProperty({
    example: 10,
    description: 'Total de páginas disponibles',
  })
  totalPages: number;
}

export class ProductListServiceResponseDto {
  @ApiProperty({
    example: true,
    description: 'Indica si la operación fue exitosa',
  })
  success: boolean;

  @ApiProperty({
    type: PaginatedProductResponseDto,
    description: 'Datos paginados de productos',
  })
  data: any;

  @ApiProperty({
    example: 'Lista de productos obtenida exitosamente',
    description: 'Mensaje de éxito',
  })
  message?: string;
}