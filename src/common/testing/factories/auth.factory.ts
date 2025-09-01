import { UserFactory } from './user.factory';

export class AuthFactory {
  static createLoginDto(overrides?: any) {
    const randomId = Math.random().toString(36).substr(2, 9);
    return {
      email: `user${randomId}@example.com`,
      password: 'password123',
      ...overrides,
    };
  }

  static createRegisterDto(overrides?: any) {
    const randomId = Math.random().toString(36).substr(2, 9);
    return {
      email: `user${randomId}@example.com`,
      password: 'password123',
      firstName: `FirstName${randomId}`,
      lastName: `LastName${randomId}`,
      ...overrides,
    };
  }

  static createLoginResponse(user?: any) {
    const baseUser = user || UserFactory.create();
    const randomToken = Math.random().toString(36).substr(2, 50);
    return {
      success: true,
      access_token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${randomToken}`,
      user: {
        _id: baseUser._id.toString(),
        email: baseUser.email,
        firstName: baseUser.firstName,
        lastName: baseUser.lastName,
        role: baseUser.role,
      },
      message: 'Inicio de sesión exitoso',
    };
  }

  static createRegisterResponse(user?: any) {
    const baseUser = user || UserFactory.create();
    const randomToken = Math.random().toString(36).substr(2, 50);
    return {
      success: true,
      access_token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${randomToken}`,
      user: {
        _id: baseUser._id.toString(),
        email: baseUser.email,
        firstName: baseUser.firstName,
        lastName: baseUser.lastName,
        role: baseUser.role,
      },
      message: 'Usuario registrado exitosamente',
    };
  }

  static createJwtPayload(user?: any) {
    const baseUser = user || UserFactory.create();
    return {
      sub: baseUser._id.toString(),
      email: baseUser.email,
      role: baseUser.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour
    };
  }

  static createValidCredentials() {
    return {
      email: 'admin@demo.com',
      password: 'demodemo',
    };
  }

  static createInvalidCredentials() {
    const randomId = Math.random().toString(36).substr(2, 9);
    return {
      email: `invalid${randomId}@example.com`,
      password: 'invalidpassword',
    };
  }
}