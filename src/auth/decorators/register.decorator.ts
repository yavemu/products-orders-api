import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { RegisterDto } from '../dto';

export function RegisterDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Registrar usuario',
      description: `
        Registra un nuevo usuario en el sistema y retorna token JWT.
        
        **Funcionalidades:**
        - Creación de nuevo usuario cliente
        - Validación de datos únicos (email)
        - Encriptación segura de contraseña
        - Generación automática de token JWT
        - Asignación automática de rol CLIENT
        
        **Validaciones aplicadas:**
        - Email único en el sistema
        - Contraseña con requisitos de seguridad
        - Nombres con formato válido
        
        **Respuesta exitosa incluye:**
        - Token JWT para autorización inmediata
        - Datos básicos del usuario creado
        - Rol asignado automáticamente (client)
      `,
    }),
    ApiBody({
      type: RegisterDto,
      description: 'Datos del nuevo usuario a registrar',
    }),
    ApiResponse({
      status: 201,
      description: 'Registro exitoso',
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
          message: 'Usuario registrado exitosamente',
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Solicitud inválida - Errores de validación',
      schema: {
        example: {
          statusCode: 400,
          message: [
            'El email es requerido',
            'La contraseña debe contener al menos: 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial',
            'El nombre solo puede contener letras y espacios',
          ],
          error: 'Bad Request',
        },
      },
    }),
    ApiResponse({
      status: 409,
      description: 'Conflicto - El email ya existe',
      schema: {
        example: {
          statusCode: 409,
          message: 'Ya existe un usuario con este email',
          error: 'Conflict',
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: 'Error interno del servidor',
      schema: {
        example: {
          statusCode: 500,
          message: 'Error interno durante el registro',
          error: 'Internal Server Error',
        },
      },
    }),
  );
}
