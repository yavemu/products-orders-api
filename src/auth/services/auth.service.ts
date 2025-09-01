import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/services/users.service';
import { RegisterDto } from '../dto';
import { LoginResponse, RegisterResponse } from '../interfaces';
import { UserRole } from '../../users/enums';
import { AuthResponseUtil } from '../utils';
import { AuthMessages } from '../enums';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async login(email: string, password: string): Promise<LoginResponse> {
    this.validateLoginInput(email, password);

    const user = await this.usersService.validateCredentials(email, password);
    if (!user) {
      throw new UnauthorizedException(AuthMessages.INVALID_CREDENTIALS);
    }

    return AuthResponseUtil.createAuthResponse(user, this.jwtService, 'login');
  }

  async register(registerDto: RegisterDto): Promise<RegisterResponse> {
    this.validateRegisterInput(registerDto);

    const userData = {
      ...registerDto,
      role: UserRole.CLIENT,
    };

    const user = await this.usersService.createForAuth(userData);
    return AuthResponseUtil.createAuthResponse(user, this.jwtService, 'register');
  }

  private validateLoginInput(email: string, password: string): void {
    if (!email?.trim()) {
      throw new BadRequestException(AuthMessages.EMAIL_REQUIRED);
    }

    if (!password?.trim()) {
      throw new BadRequestException(AuthMessages.PASSWORD_REQUIRED);
    }
  }

  private validateRegisterInput(registerDto: RegisterDto): void {
    if (!registerDto) {
      throw new BadRequestException(AuthMessages.REGISTER_DATA_REQUIRED);
    }
  }
}
