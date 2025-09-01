import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../enums';

export class UserResponseDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'ID único del usuario',
  })
  _id: string;

  @ApiProperty({
    example: 'Yam',
    description: 'Nombre del usuario',
  })
  firstName: string;

  @ApiProperty({
    example: 'Vélez',
    description: 'Apellido del usuario',
  })
  lastName: string;

  @ApiProperty({
    example: 'yam@example.com',
    description: 'Email del usuario',
  })
  email: string;

  @ApiProperty({
    example: UserRole.CLIENT,
    description: 'Rol del usuario',
    enum: UserRole,
  })
  role: UserRole;

  @ApiPropertyOptional({
    example: 'Yam Vélez',
    description: 'Nombre completo del usuario',
  })
  fullName?: string;

  @ApiProperty({
    example: '2025-08-31T21:00:00.000Z',
    description: 'Fecha de creación del usuario',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2025-08-31T21:00:00.000Z',
    description: 'Fecha de última actualización del usuario',
  })
  updatedAt: Date;
}

export class PaginatedUserResponseDto {
  @ApiProperty({
    type: [UserResponseDto],
    description: 'Lista de usuarios',
  })
  data: UserResponseDto[];

  @ApiProperty({
    example: 1,
    description: 'Página actual',
  })
  page: number;

  @ApiProperty({
    example: 10,
    description: 'Cantidad de elementos por página',
  })
  limit: number;

  @ApiProperty({
    example: 100,
    description: 'Total de usuarios encontrados',
  })
  total: number;

  @ApiProperty({
    example: 10,
    description: 'Total de páginas disponibles',
  })
  totalPages: number;
}

export class UserServiceResponseDto {
  @ApiProperty({
    example: true,
    description: 'Indica si la operación fue exitosa',
  })
  success: boolean;

  @ApiPropertyOptional({
    type: UserResponseDto,
    description: 'Datos del usuario (si aplica)',
  })
  data?: UserResponseDto;

  @ApiPropertyOptional({
    example: 'Usuario creado exitosamente',
    description: 'Mensaje de éxito',
  })
  message?: string;

  @ApiPropertyOptional({
    example: 'Error al procesar la solicitud',
    description: 'Mensaje de error',
  })
  error?: string;
}

export class UserListServiceResponseDto {
  @ApiProperty({
    example: true,
    description: 'Indica si la operación fue exitosa',
  })
  success: boolean;

  @ApiPropertyOptional({
    type: PaginatedUserResponseDto,
    description: 'Datos paginados de usuarios',
  })
  data?: any;

  @ApiPropertyOptional({
    example: 'Lista de usuarios obtenida exitosamente',
    description: 'Mensaje de éxito',
  })
  message?: string;

  @ApiPropertyOptional({
    example: 'Error al procesar la solicitud',
    description: 'Mensaje de error',
  })
  error?: string;
}
