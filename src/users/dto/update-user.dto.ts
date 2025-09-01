import { IsString, IsOptional, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Yam Updated', description: 'Nombre del usuario' })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @Matches(/^[a-zA-Z\s]+$/, { message: 'El nombre solo puede contener letras y espacios' })
  firstName?: string;

  @ApiPropertyOptional({ example: 'Vélez Updated', description: 'Apellido del usuario' })
  @IsOptional()
  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  @Matches(/^[a-zA-Z\s]+$/, { message: 'El apellido solo puede contener letras y espacios' })
  lastName?: string;
}
