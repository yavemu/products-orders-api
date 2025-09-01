import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsPositive,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'Nombre del producto',
    example: 'Laptop Gaming ASUS ROG',
    type: String,
    required: true,
    minLength: 3,
    maxLength: 100,
  })
  @IsString({ message: 'El nombre del producto debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre del producto es requerido' })
  @MinLength(3, { message: 'El nombre del producto debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El nombre del producto no puede exceder 100 caracteres' })
  @Matches(/^[a-zA-Z0-9À-ÿ\u00f1\u00d1\s\-_.,()]+$/, {
    message: 'El nombre solo puede contener letras, números, espacios y caracteres básicos',
  })
  name: string;

  @ApiProperty({
    description: 'SKU del producto - Código único de inventario',
    example: 'LP-ASUS-ROG-2024-001',
    type: String,
    required: true,
    minLength: 5,
    maxLength: 50,
    pattern: '^[A-Z0-9-]+$',
  })
  @IsString({ message: 'El SKU debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El SKU es requerido' })
  @MinLength(5, { message: 'El SKU debe tener al menos 5 caracteres' })
  @MaxLength(50, { message: 'El SKU no puede exceder 50 caracteres' })
  @Matches(/^[A-Z0-9-]+$/, {
    message: 'El SKU solo puede contener letras mayúsculas, números y guiones',
  })
  sku: string;

  @ApiProperty({
    description: 'Precio del producto en USD - debe ser un número positivo con hasta 2 decimales',
    example: 1299.99,
    type: Number,
    required: true,
    minimum: 0.01,
    maximum: 999999.99,
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El precio debe ser un número con hasta 2 decimales' },
  )
  @IsNotEmpty({ message: 'El precio es requerido' })
  @IsPositive({ message: 'El precio debe ser un número positivo' })
  price: number;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Archivo de imagen del producto - formatos soportados: JPG, PNG, WEBP (máx 5MB)',
    required: true,
  })
  picture?: any;
}
