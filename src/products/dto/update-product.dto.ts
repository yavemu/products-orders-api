import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsPositive,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class UpdateProductDto {
  @ApiPropertyOptional({
    description: 'Nombre del producto',
    example: 'Laptop Gaming ASUS ROG Updated',
    type: String,
    minLength: 3,
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'El nombre del producto debe ser una cadena de texto' })
  @MinLength(3, { message: 'El nombre del producto debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El nombre del producto no puede exceder 100 caracteres' })
  @Matches(/^[a-zA-Z0-9À-ÿ\u00f1\u00d1\s\-_.,()]+$/, {
    message: 'El nombre solo puede contener letras, números, espacios y caracteres básicos',
  })
  name?: string;

  @ApiPropertyOptional({
    description: 'Precio del producto en USD - debe ser un número positivo con hasta 2 decimales',
    example: 1199.99,
    type: Number,
    minimum: 0.01,
    maximum: 999999.99,
  })
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El precio debe ser un número con hasta 2 decimales' },
  )
  @IsPositive({ message: 'El precio debe ser un número positivo' })
  price?: number;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description:
      'Nuevo archivo de imagen del producto - formatos soportados: JPG, PNG, WEBP (máx 5MB)',
  })
  picture?: any;
}
