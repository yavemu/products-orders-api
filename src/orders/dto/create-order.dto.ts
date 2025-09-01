import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  IsNotEmpty,
  ValidateNested,
  MinLength,
  MaxLength,
  IsPositive,
  Min,
  Max,
  ArrayMinSize,
  ArrayMaxSize,
  IsMongoId,
  Matches,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderProductDto {
  @ApiProperty({
    description: 'ID del producto a incluir en la orden',
    example: '507f1f77bcf86cd799439011',
    type: String,
    format: 'ObjectId',
    required: true,
  })
  @IsString({ message: 'El ID del producto debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El ID del producto es requerido' })
  @IsMongoId({ message: 'El ID del producto debe ser un ObjectId de MongoDB válido' })
  productId: string;

  @ApiProperty({
    description: 'Cantidad del producto a ordenar - debe ser un entero positivo',
    example: 2,
    type: Number,
    required: true,
    minimum: 1,
    maximum: 1000,
  })
  @Type(() => Number)
  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @IsNotEmpty({ message: 'La cantidad es requerida' })
  @IsPositive({ message: 'La cantidad debe ser un número positivo' })
  @Min(1, { message: 'La cantidad mínima es 1' })
  @Max(1000, { message: 'La cantidad máxima es 1000' })
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'Nombre completo del cliente que realiza la orden',
    example: 'Juan Pérez García',
    type: String,
    required: true,
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'El nombre del cliente debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre del cliente es requerido' })
  @MinLength(2, { message: 'El nombre del cliente debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre del cliente no puede exceder 100 caracteres' })
  @Matches(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/, {
    message: 'El nombre del cliente solo puede contener letras y espacios',
  })
  clientName: string;

  @ApiProperty({
    description: 'Lista de productos a incluir en la orden - mínimo 1, máximo 50 productos',
    type: [OrderProductDto],
    required: true,
    minItems: 1,
    maxItems: 50,
  })
  @IsArray({ message: 'Los productos deben ser un array' })
  @ArrayMinSize(1, { message: 'Se requiere al menos un producto' })
  @ArrayMaxSize(50, { message: 'Máximo 50 productos permitidos por orden' })
  @ValidateNested({ each: true })
  @Type(() => OrderProductDto)
  products: OrderProductDto[];
}
