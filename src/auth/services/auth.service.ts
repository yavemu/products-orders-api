import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/services/users.service';
import { RegisterDto } from '../dto';
import { LoginResponse, RegisterResponse } from '../interfaces';
import { User } from '../../users/schemas/user.schema';
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
    const user = await this.usersService.validateCredentials(email, password);
    if (!user) {
      throw new UnauthorizedException(AuthMessages.INVALID_CREDENTIALS);
    }

    return AuthResponseUtil.createAuthResponse(user, this.jwtService, 'login');
  }

  async register(registerDto: RegisterDto): Promise<RegisterResponse> {
    const userData = {
      ...registerDto,
      role: UserRole.CLIENT,
    };

    const user = await this.usersService.createForAuth(userData);
    return AuthResponseUtil.createAuthResponse(user, this.jwtService, 'register');
  }
}
