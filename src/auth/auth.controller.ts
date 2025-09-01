import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { LoginDto, RegisterDto } from './dto';
import { LoginResponse, RegisterResponse } from './interfaces';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar sesión',
    description: 'Autentica usuario con email y contraseña, retorna token JWT para acceso a la API',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
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
        },
        message: 'Inicio de sesión exitoso',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Solicitud inválida - Errores de validación',
    schema: {
      example: {
        statusCode: 400,
        message: ['El email es requerido', 'La contraseña debe tener al menos 8 caracteres'],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Credenciales inválidas',
    schema: {
      example: {
        statusCode: 401,
        message: 'Credenciales inválidas',
        error: 'Unauthorized',
      },
    },
  })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar usuario',
    description: 'Registra un nuevo usuario en el sistema y retorna token JWT',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
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
        },
        message: 'Usuario registrado exitosamente',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Solicitud inválida - Errores de validación',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'El email es requerido',
          'La contraseña debe contener al menos: 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial',
        ],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Conflicto - El email ya existe',
    schema: {
      example: {
        statusCode: 409,
        message: 'Ya existe un usuario con este email',
        error: 'Conflict',
      },
    },
  })
  async register(@Body() registerDto: RegisterDto): Promise<RegisterResponse> {
    return this.authService.register(registerDto);
  }
}
