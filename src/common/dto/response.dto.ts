import { ApiProperty } from '@nestjs/swagger';

export class StandardResponseDto<T = any> {
  @ApiProperty({ example: true, description: 'Indica si la operación fue exitosa' })
  success: boolean;

  @ApiProperty({ example: 200, description: 'Código de estado HTTP' })
  statusCode: number;

  @ApiProperty({ description: 'Mensaje de respuesta' })
  message?: string;

  @ApiProperty({ description: 'Datos de respuesta' })
  data?: T;

  @ApiProperty({ description: 'Mensaje de error en caso de fallo' })
  error?: string;
}

export class PaginationMetaDto {
  @ApiProperty({ example: 1, description: 'Página actual' })
  page: number;

  @ApiProperty({ example: 10, description: 'Elementos por página' })
  limit: number;

  @ApiProperty({ example: 100, description: 'Total de elementos' })
  total: number;

  @ApiProperty({ example: 10, description: 'Total de páginas' })
  totalPages: number;
}

export class PaginatedResponseDto<T = any> {
  @ApiProperty({ description: 'Datos paginados' })
  data: T[];

  @ApiProperty({ type: PaginationMetaDto, description: 'Información de paginación' })
  meta: PaginationMetaDto;
}

export class StandardListResponseDto<T = any> extends StandardResponseDto<
  PaginatedResponseDto<T>
> {}

export class ErrorResponseDto {
  @ApiProperty({ example: false, description: 'Indica si la operación fue exitosa' })
  success: boolean;

  @ApiProperty({ example: 400, description: 'Código de estado HTTP' })
  statusCode: number;

  @ApiProperty({ example: 'Error de validación', description: 'Mensaje de error' })
  error: string;
}
