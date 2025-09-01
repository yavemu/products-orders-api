import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductResponseDto } from './product-response.dto';

export class ProductServiceResponseDto {
  @ApiProperty({
    example: true,
    description: 'Indica si la operación fue exitosa',
  })
  success: boolean;

  @ApiPropertyOptional({
    type: ProductResponseDto,
    description: 'Datos del producto (si aplica)',
  })
  data?: ProductResponseDto;

  @ApiPropertyOptional({
    example: 'Producto creado exitosamente',
    description: 'Mensaje de éxito',
  })
  message?: string;

  @ApiPropertyOptional({
    example: 'Error al procesar la solicitud',
    description: 'Mensaje de error',
  })
  error?: string;
}

export class DeleteProductResponseDto {
  @ApiProperty({ example: 'Producto eliminado exitosamente' })
  message: string;
}