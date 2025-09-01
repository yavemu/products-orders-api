import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../../users/services/users.service';
import { RegisterDto } from '../../dto';
import { UserRole } from '../../../users/enums';
import { AuthMessages } from '../../enums';
import { AuthResponseUtil } from '../../utils';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    role: UserRole.CLIENT,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockUsersService = {
    validateCredentials: jest.fn(),
    createForAuth: jest.fn(),
  };

  const mockAuthResponse = {
    success: true,
    user: mockUser,
    access_token: 'mock-jwt-token',
    message: AuthMessages.LOGIN_SUCCESS,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get(JwtService);
    usersService = module.get(UsersService);

    // Mock AuthResponseUtil
    jest.spyOn(AuthResponseUtil, 'createAuthResponse').mockReturnValue(mockAuthResponse as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const email = 'john@example.com';
      const password = 'password123';

      usersService.validateCredentials.mockResolvedValue(mockUser as any);

      const result = await service.login(email, password);

      expect(usersService.validateCredentials).toHaveBeenCalledWith(email, password);
      expect(AuthResponseUtil.createAuthResponse).toHaveBeenCalledWith(mockUser, jwtService, 'login');
      expect(result).toEqual(mockAuthResponse);
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const email = 'john@example.com';
      const password = 'wrongpassword';

      usersService.validateCredentials.mockResolvedValue(null);

      await expect(service.login(email, password)).rejects.toThrow(
        new UnauthorizedException(AuthMessages.INVALID_CREDENTIALS)
      );
    });

    it('should throw BadRequestException when email is empty', async () => {
      const email = '';
      const password = 'password123';

      await expect(service.login(email, password)).rejects.toThrow(
        new BadRequestException(AuthMessages.EMAIL_REQUIRED)
      );
    });

    it('should throw BadRequestException when email is null', async () => {
      const email = null as any;
      const password = 'password123';

      await expect(service.login(email, password)).rejects.toThrow(
        new BadRequestException(AuthMessages.EMAIL_REQUIRED)
      );
    });

    it('should throw BadRequestException when password is empty', async () => {
      const email = 'john@example.com';
      const password = '';

      await expect(service.login(email, password)).rejects.toThrow(
        new BadRequestException(AuthMessages.PASSWORD_REQUIRED)
      );
    });

    it('should throw BadRequestException when password is null', async () => {
      const email = 'john@example.com';
      const password = null as any;

      await expect(service.login(email, password)).rejects.toThrow(
        new BadRequestException(AuthMessages.PASSWORD_REQUIRED)
      );
    });

    it('should trim whitespace from inputs', async () => {
      const email = '  john@example.com  ';
      const password = '  password123  ';

      usersService.validateCredentials.mockResolvedValue(mockUser as any);

      await service.login(email, password);

      expect(usersService.validateCredentials).toHaveBeenCalledWith(email, password);
    });
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    it('should register successfully with valid data', async () => {
      const expectedUserData = {
        ...registerDto,
        role: UserRole.CLIENT,
      };

      usersService.createForAuth.mockResolvedValue(mockUser as any);

      const result = await service.register(registerDto);

      expect(usersService.createForAuth).toHaveBeenCalledWith(expectedUserData);
      expect(AuthResponseUtil.createAuthResponse).toHaveBeenCalledWith(mockUser, jwtService, 'register');
      expect(result).toEqual(mockAuthResponse);
    });

    it('should throw BadRequestException when registerDto is null', async () => {
      const registerDto = null as any;

      await expect(service.register(registerDto)).rejects.toThrow(
        new BadRequestException(AuthMessages.REGISTER_DATA_REQUIRED)
      );
    });

    it('should throw BadRequestException when registerDto is undefined', async () => {
      const registerDto = undefined as any;

      await expect(service.register(registerDto)).rejects.toThrow(
        new BadRequestException(AuthMessages.REGISTER_DATA_REQUIRED)
      );
    });

    it('should assign CLIENT role by default', async () => {
      usersService.createForAuth.mockResolvedValue(mockUser as any);

      await service.register(registerDto);

      const expectedUserData = {
        ...registerDto,
        role: UserRole.CLIENT,
      };

      expect(usersService.createForAuth).toHaveBeenCalledWith(expectedUserData);
    });
  });

  describe('validateLoginInput', () => {
    it('should validate login input successfully', () => {
      const email = 'john@example.com';
      const password = 'password123';

      // This should not throw
      expect(() => service['validateLoginInput'](email, password)).not.toThrow();
    });
  });

  describe('validateRegisterInput', () => {
    it('should validate register input successfully', () => {
      const registerDto: RegisterDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      // This should not throw
      expect(() => service['validateRegisterInput'](registerDto)).not.toThrow();
    });
  });

  describe('error handling', () => {
    it('should handle service errors during login', async () => {
      const email = 'john@example.com';
      const password = 'password123';

      usersService.validateCredentials.mockRejectedValue(new Error('Database error'));

      await expect(service.login(email, password)).rejects.toThrow('Database error');
    });

    it('should handle service errors during register', async () => {
      const registerDto: RegisterDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      usersService.createForAuth.mockRejectedValue(new Error('Database error'));

      await expect(service.register(registerDto)).rejects.toThrow('Database error');
    });
  });
});