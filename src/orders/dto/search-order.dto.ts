import { IsOptional, IsString, IsNumber, IsIn, Min, Max, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class SearchOrderDto {
  @ApiPropertyOptional({
    example: 'Juan',
    description: 'Filtrar por nombre del cliente',
  })
  @IsOptional()
  @IsString({ message: 'El nombre del cliente debe ser una cadena de texto' })
  @Matches(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/, {
    message: 'El nombre del cliente solo puede contener letras y espacios',
  })
  @Transform(({ value }) => value?.trim())
  clientName?: string;

  @ApiPropertyOptional({
    example: 'ORD-20241201',
    description: 'Filtrar por identificador de orden',
  })
  @IsOptional()
  @IsString({ message: 'El identificador debe ser una cadena de texto' })
  @Transform(({ value }) => value?.toUpperCase()?.trim())
  identifier?: string;

  @ApiPropertyOptional({
    example: 'pending',
    description: 'Filtrar por estado de la orden',
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
  })
  @IsOptional()
  @IsString({ message: 'El estado debe ser una cadena de texto' })
  @IsIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'], {
    message: 'El estado debe ser uno de: pending, processing, shipped, delivered, cancelled',
  })
  status?: string;

  @ApiPropertyOptional({
    example: 100,
    description: 'Total mínimo para filtrar',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El total mínimo debe ser un número con hasta 2 decimales' },
  )
  @Min(0, { message: 'El total mínimo debe ser mayor o igual a 0' })
  minTotal?: number;

  @ApiPropertyOptional({
    example: 5000,
    description: 'Total máximo para filtrar',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El total máximo debe ser un número con hasta 2 decimales' },
  )
  @Min(0, { message: 'El total máximo debe ser mayor o igual a 0' })
  maxTotal?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Número de página',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'La página debe ser un número' })
  @Min(1, { message: 'La página debe ser mayor a 0' })
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: 'Cantidad de resultados por página',
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El límite debe ser un número' })
  @Min(1, { message: 'El límite debe ser mayor a 0' })
  @Max(100, { message: 'El límite no puede ser mayor a 100' })
  limit?: number = 10;
}
