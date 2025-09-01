import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { LoginDto } from '../dto';

export function LoginDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Iniciar sesión',
      description: `
        Autentica usuario con email y contraseña, retorna token JWT para acceso a la API.
        
        **Funcionalidades:**
        - Validación de credenciales
        - Generación de token JWT
        - Retorno de información del usuario
        - Manejo seguro de autenticación
        
        **Requisitos:**
        - Email válido registrado en el sistema
        - Contraseña correcta
        
        **Respuesta exitosa incluye:**
        - Token JWT para autorización
        - Datos básicos del usuario
        - Rol del usuario (admin/client)
      `,
    }),
    ApiBody({
      type: LoginDto,
      description: 'Credenciales de acceso del usuario',
    }),
    ApiResponse({
      status: 200,
      description: 'Autenticación exitosa',
      schema: {
        example: {
          success: true,
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          user: {
            _id: '507f1f77bcf86cd799439011',
            email: 'yam@example.com',
            firstName: 'Yam',
            lastName: 'Vélez',
            role: 'client',
          },
          message: 'Inicio de sesión exitoso',
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Solicitud inválida - Errores de validación',
      schema: {
        example: {
          statusCode: 400,
          message: ['El email es requerido', 'La contraseña debe tener al menos 8 caracteres'],
          error: 'Bad Request',
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'No autorizado - Credenciales inválidas',
      schema: {
        example: {
          statusCode: 401,
          message: 'Credenciales inválidas',
          error: 'Unauthorized',
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: 'Error interno del servidor',
      schema: {
        example: {
          statusCode: 500,
          message: 'Error interno durante el inicio de sesión',
          error: 'Internal Server Error',
        },
      },
    }),
  );
}
