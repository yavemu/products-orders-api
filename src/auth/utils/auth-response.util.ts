import { JwtService } from '@nestjs/jwt';
import { User } from '../../users/schemas/user.schema';
import { AuthUser, LoginResponse, RegisterResponse } from '../../auth/interfaces';

export class AuthResponseUtil {
  /**
   * Mapea un usuario de la base de datos a la interfaz AuthUser
   */
  static mapToAuthUser(user: User): AuthUser {
    return {
      _id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
  }

  /**
   * Genera el payload para el JWT
   */
  static generateJwtPayload(user: User): Record<string, any> {
    return {
      sub: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
  }

  /**
   * Crea una respuesta de login exitosa
   */
  static createLoginResponse(
    user: User,
    accessToken: string,
    message: string = 'Inicio de sesión exitoso',
  ): LoginResponse {
    return {
      success: true,
      access_token: accessToken,
      user: this.mapToAuthUser(user),
      message,
    };
  }

  /**
   * Crea una respuesta de registro exitosa
   */
  static createRegisterResponse(
    user: User,
    accessToken: string,
    message: string = 'Usuario registrado exitosamente',
  ): RegisterResponse {
    return {
      success: true,
      access_token: accessToken,
      user: this.mapToAuthUser(user),
      message,
    };
  }

  /**
   * Genera token JWT para un usuario
   */
  static generateAccessToken(user: User, jwtService: JwtService): string {
    const payload = this.generateJwtPayload(user);
    return jwtService.sign(payload);
  }

  /**
   * Crea respuesta completa de autenticación (login/register)
   */
  static createAuthResponse(
    user: User,
    jwtService: JwtService,
    type: 'login' | 'register' = 'login',
  ): LoginResponse | RegisterResponse {
    const accessToken = this.generateAccessToken(user, jwtService);

    if (type === 'register') {
      return this.createRegisterResponse(user, accessToken);
    }

    return this.createLoginResponse(user, accessToken);
  }
}
