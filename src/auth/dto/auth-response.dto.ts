import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuthUserDto {
  @ApiProperty({
    description: 'ID único del usuario',
    example: '507f1f77bcf86cd799439011',
  })
  _id: string;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'yam@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Yam',
  })
  firstName: string;

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Vélez',
  })
  lastName: string;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'Indica si la operación fue exitosa',
    example: true,
  })
  success: boolean;

  @ApiPropertyOptional({
    description:
      'JWT access token para autenticación - incluir en header Authorization como "Bearer {token}"',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJpYXQiOjE2OTMzMTQwMDAsImV4cCI6MTY5MzMxNzYwMH0.signature',
    type: String,
    format: 'jwt',
  })
  access_token?: string;

  @ApiPropertyOptional({
    description: 'Datos del usuario autenticado',
    type: AuthUserDto,
  })
  user?: AuthUserDto;

  @ApiPropertyOptional({
    description: 'Mensaje de éxito',
    example: 'Inicio de sesión exitoso',
  })
  message?: string;

  @ApiPropertyOptional({
    description: 'Mensaje de error',
    example: 'Credenciales inválidas',
  })
  error?: string;
}
