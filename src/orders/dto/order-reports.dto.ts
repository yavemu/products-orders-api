import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsOptional,
  IsMongoId,
  IsString,
  IsBoolean,
  IsIn,
  IsNotEmpty,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class OrderReportsDto {
  @ApiProperty({
    description: 'Fecha de inicio del rango de consulta (obligatorio)',
    example: '2025-01-01',
    type: String,
    format: 'date',
    required: true,
  })
  @IsNotEmpty({ message: 'La fecha de inicio es requerida' })
  @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha válida (YYYY-MM-DD)' })
  startDate: string;

  @ApiProperty({
    description: 'Fecha de fin del rango de consulta (obligatorio)',
    example: '2025-12-31',
    type: String,
    format: 'date',
    required: true,
  })
  @IsNotEmpty({ message: 'La fecha de fin es requerida' })
  @IsDateString({}, { message: 'La fecha de fin debe ser una fecha válida (YYYY-MM-DD)' })
  endDate: string;

  @ApiPropertyOptional({
    description: 'ID del cliente para filtrar órdenes (opcional)',
    example: '507f1f77bcf86cd799439011',
    type: String,
    format: 'ObjectId',
  })
  @IsOptional()
  @IsMongoId({ message: 'El ID del cliente debe ser un ObjectId válido' })
  clientId?: string;

  @ApiPropertyOptional({
    description: 'ID del producto para filtrar órdenes que contengan este producto (opcional)',
    example: '507f1f77bcf86cd799439012',
    type: String,
    format: 'ObjectId',
  })
  @IsOptional()
  @IsMongoId({ message: 'El ID del producto debe ser un ObjectId válido' })
  productId?: string;

  @ApiPropertyOptional({
    description: 'Orden de los resultados',
    example: 'total_desc',
    enum: [
      'total_desc',
      'total_asc',
      'date_desc',
      'date_asc',
      'quantity_desc',
      'quantity_asc',
      'client_name_asc',
      'client_name_desc',
    ],
    default: 'total_desc',
  })
  @IsOptional()
  @IsString({ message: 'El orden debe ser una cadena de texto' })
  @IsIn(
    [
      'total_desc',
      'total_asc',
      'date_desc',
      'date_asc',
      'quantity_desc',
      'quantity_asc',
      'client_name_asc',
      'client_name_desc',
    ],
    {
      message:
        'El orden debe ser uno de: total_desc, total_asc, date_desc, date_asc, quantity_desc, quantity_asc, client_name_asc, client_name_desc',
    },
  )
  sortBy?: string = 'total_desc';

  @ApiPropertyOptional({
    description: 'Si true retorna CSV, si false retorna JSON',
    example: false,
    type: Boolean,
    default: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  })
  @IsBoolean({ message: 'El formato CSV debe ser un valor booleano' })
  returnCsv?: boolean = false;

  @ApiPropertyOptional({
    description: 'Página para paginación (solo aplica para JSON)',
    example: 1,
    type: Number,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Límite de resultados por página (solo aplica para JSON)',
    example: 10,
    type: Number,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;
}

export class OrderReportItemDto {
  @ApiProperty({
    description: 'ID único de la orden',
    example: '507f1f77bcf86cd799439011',
  })
  orderId: string;

  @ApiProperty({
    description: 'Identificador legible de la orden',
    example: 'ORD-20250101-ABC123',
  })
  identifier: string;

  @ApiProperty({
    description: 'ID del cliente',
    example: '507f1f77bcf86cd799439012',
  })
  clientId: string;

  @ApiProperty({
    description: 'Nombre del cliente',
    example: 'Juan Pérez García',
  })
  clientName: string;

  @ApiProperty({
    description: 'Total de la orden',
    example: 1299.99,
  })
  total: number;

  @ApiProperty({
    description: 'Cantidad total de productos',
    example: 5,
  })
  totalQuantity: number;

  @ApiProperty({
    description: 'Estado de la orden',
    example: 'delivered',
  })
  status: string;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2025-01-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Lista de productos en la orden',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        productId: { type: 'string', example: '507f1f77bcf86cd799439013' },
        name: { type: 'string', example: 'iPhone 14 Pro' },
        quantity: { type: 'number', example: 2 },
        price: { type: 'number', example: 1299.99 },
      },
    },
  })
  products: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
}

export class OrderReportsResponseDto {
  @ApiProperty({
    description: 'Lista de órdenes que cumplen los criterios',
    type: [OrderReportItemDto],
  })
  data: OrderReportItemDto[];

  @ApiProperty({
    description: 'Total de registros encontrados',
    example: 150,
  })
  total: number;

  @ApiProperty({
    description: 'Página actual',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Límite por página',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Total de páginas',
    example: 15,
  })
  totalPages: number;

  @ApiProperty({
    description: 'Filtros aplicados',
    type: 'object',
  })
  filters: {
    startDate: string;
    endDate: string;
    clientId?: string;
    productId?: string;
    sortBy: string;
  };

  @ApiProperty({
    description: 'Resumen estadístico del reporte',
    type: 'object',
  })
  summary: {
    totalOrders: number;
    totalRevenue: number;
    totalQuantitySold: number;
    averageOrderValue: number;
  };
}
