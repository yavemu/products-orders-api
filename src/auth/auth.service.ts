import { Injectable, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/services/users.service';
import { RegisterDto } from './dto';
import { LoginResponse, RegisterResponse, ValidateUserResponse, AuthUser } from './interfaces';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async validateUser(email: string, password: string): Promise<ValidateUserResponse> {
    try {
      this.logger.log(`Attempting to validate user: ${email}`);

      const user = await this.usersService.findOneByEmail(email);
      if (!user) {
        this.logger.warn(`User not found: ${email}`);
        return {
          success: false,
          message: 'Credenciales inválidas',
        };
      }

      // Usar el método comparePassword del schema
      const userDoc = user as unknown as {
        comparePassword: (password: string) => Promise<boolean>;
      };
      const isPasswordValid = await userDoc.comparePassword(password);
      if (!isPasswordValid) {
        this.logger.warn(`Invalid password for user: ${email}`);
        return {
          success: false,
          message: 'Credenciales inválidas',
        };
      }

      this.logger.log(`User validated successfully: ${email}`);
      return {
        success: true,
        user,
      };
    } catch (error) {
      this.logger.error(`Error validating user ${email}: ${error.message}`, error.stack);
      throw new BadRequestException('Error al validar credenciales');
    }
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      this.logger.log(`Login attempt for: ${email}`);

      const validation = await this.validateUser(email, password);
      if (!validation.success || !validation.user) {
        throw new UnauthorizedException('Credenciales inválidas');
      }

      const authUser: AuthUser = {
        _id: validation.user._id.toString(),
        email: validation.user.email,
        firstName: validation.user.firstName,
        lastName: validation.user.lastName,
      };

      const payload = {
        sub: validation.user._id,
        email: validation.user.email,
        firstName: validation.user.firstName,
        lastName: validation.user.lastName,
      };

      const access_token = this.jwtService.sign(payload);

      this.logger.log(`Login successful for user: ${email}`);
      return {
        success: true,
        access_token,
        user: authUser,
        message: 'Inicio de sesión exitoso',
      };
    } catch (error) {
      this.logger.error(`Login failed for ${email}: ${error.message}`, error.stack);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Error durante el inicio de sesión');
    }
  }

  async register(registerDto: RegisterDto): Promise<RegisterResponse> {
    try {
      this.logger.log(`Registration attempt for: ${registerDto.email}`);

      const userResponse = (await this.usersService.create(registerDto)) as User;
      if (!userResponse) {
        throw new BadRequestException('Error al crear usuario');
      }

      const authUser: AuthUser = {
        _id: (userResponse as any)._id.toString(),
        email: userResponse.email,
        firstName: userResponse.firstName,
        lastName: userResponse.lastName,
      };

      const payload = {
        sub: (userResponse as any)._id,
        email: userResponse.email,
        firstName: userResponse.firstName,
        lastName: userResponse.lastName,
      };

      const access_token = this.jwtService.sign(payload);

      this.logger.log(`Registration successful for user: ${registerDto.email}`);
      return {
        success: true,
        access_token,
        user: authUser,
        message: 'Usuario registrado exitosamente',
      };
    } catch (error) {
      this.logger.error(
        `Registration failed for ${registerDto.email}: ${error.message}`,
        error.stack,
      );
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error durante el registro');
    }
  }
}
