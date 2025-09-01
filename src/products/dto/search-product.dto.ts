import { IsOptional, IsString, IsNumber, IsPositive, Min, Max, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class SearchProductDto {
  @ApiPropertyOptional({
    example: 'Laptop',
    description: 'Filtrar por nombre del producto',
  })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @Matches(/^[a-zA-Z0-9À-ÿ\u00f1\u00d1\s\-_.,()]+$/, {
    message: 'El nombre solo puede contener letras, números, espacios y caracteres básicos',
  })
  @Transform(({ value }) => value?.trim())
  name?: string;

  @ApiPropertyOptional({
    example: 'LP-ASUS',
    description: 'Filtrar por SKU del producto',
  })
  @IsOptional()
  @IsString({ message: 'El SKU debe ser una cadena de texto' })
  @Matches(/^[A-Z0-9-]+$/, {
    message: 'El SKU solo puede contener letras mayúsculas, números y guiones',
  })
  @Transform(({ value }) => value?.toUpperCase()?.trim())
  sku?: string;

  @ApiPropertyOptional({
    example: 100,
    description: 'Precio mínimo para filtrar',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El precio mínimo debe ser un número con hasta 2 decimales' },
  )
  @IsPositive({ message: 'El precio mínimo debe ser positivo' })
  minPrice?: number;

  @ApiPropertyOptional({
    example: 2000,
    description: 'Precio máximo para filtrar',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El precio máximo debe ser un número con hasta 2 decimales' },
  )
  @IsPositive({ message: 'El precio máximo debe ser positivo' })
  maxPrice?: number;

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
