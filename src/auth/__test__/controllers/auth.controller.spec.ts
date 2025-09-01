import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthController } from '../../auth.controller';
import { AuthService } from '../../services/auth.service';
import { LoginDto, RegisterDto } from '../../dto';
import { UserRole } from '../../../users/enums';
import { AuthMessages } from '../../enums';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

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

  const mockLoginResponse = {
    success: true,
    user: mockUser,
    access_token: 'mock-jwt-token',
    message: AuthMessages.LOGIN_SUCCESS,
  };

  const mockRegisterResponse = {
    success: true,
    user: mockUser,
    access_token: 'mock-jwt-token',
    message: AuthMessages.REGISTER_SUCCESS,
  };

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'john@example.com',
      password: 'password123',
    };

    it('should login successfully with valid credentials', async () => {
      authService.login.mockResolvedValue(mockLoginResponse as any);

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto.email, loginDto.password);
      expect(result).toEqual(mockLoginResponse);
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      authService.login.mockRejectedValue(new UnauthorizedException(AuthMessages.INVALID_CREDENTIALS));

      await expect(controller.login(loginDto)).rejects.toThrow(
        new UnauthorizedException(AuthMessages.INVALID_CREDENTIALS)
      );
    });

    it('should throw BadRequestException for invalid email', async () => {
      const invalidLoginDto: LoginDto = {
        email: '',
        password: 'password123',
      };

      authService.login.mockRejectedValue(new BadRequestException(AuthMessages.EMAIL_REQUIRED));

      await expect(controller.login(invalidLoginDto)).rejects.toThrow(
        new BadRequestException(AuthMessages.EMAIL_REQUIRED)
      );
    });

    it('should throw BadRequestException for invalid password', async () => {
      const invalidLoginDto: LoginDto = {
        email: 'john@example.com',
        password: '',
      };

      authService.login.mockRejectedValue(new BadRequestException(AuthMessages.PASSWORD_REQUIRED));

      await expect(controller.login(invalidLoginDto)).rejects.toThrow(
        new BadRequestException(AuthMessages.PASSWORD_REQUIRED)
      );
    });

    it('should handle service errors properly', async () => {
      authService.login.mockRejectedValue(new Error('Service error'));

      await expect(controller.login(loginDto)).rejects.toThrow('Service error');
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
      authService.register.mockResolvedValue(mockRegisterResponse as any);

      const result = await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(mockRegisterResponse);
    });

    it('should throw BadRequestException for invalid register data', async () => {
      const invalidRegisterDto = null as any;

      authService.register.mockRejectedValue(new BadRequestException(AuthMessages.REGISTER_DATA_REQUIRED));

      await expect(controller.register(invalidRegisterDto)).rejects.toThrow(
        new BadRequestException(AuthMessages.REGISTER_DATA_REQUIRED)
      );
    });

    it('should handle service errors properly', async () => {
      authService.register.mockRejectedValue(new Error('Service error'));

      await expect(controller.register(registerDto)).rejects.toThrow('Service error');
    });

    it('should pass complete registerDto to service', async () => {
      authService.register.mockResolvedValue(mockRegisterResponse as any);

      await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(authService.register).toHaveBeenCalledTimes(1);
    });
  });

  describe('controller endpoints', () => {
    it('should have login endpoint', () => {
      expect(controller.login).toBeDefined();
      expect(typeof controller.login).toBe('function');
    });

    it('should have register endpoint', () => {
      expect(controller.register).toBeDefined();
      expect(typeof controller.register).toBe('function');
    });
  });

  describe('dependency injection', () => {
    it('should inject AuthService properly', () => {
      expect(controller['authService']).toBeDefined();
      expect(controller['authService']).toBe(authService);
    });
  });

  describe('return types', () => {
    it('should return Promise<LoginResponse> from login', async () => {
      const loginDto: LoginDto = {
        email: 'john@example.com',
        password: 'password123',
      };

      authService.login.mockResolvedValue(mockLoginResponse as any);

      const result = await controller.login(loginDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('message');
      expect(result.user).toEqual(mockUser);
      expect(typeof result.access_token).toBe('string');
      expect(typeof result.message).toBe('string');
    });

    it('should return Promise<RegisterResponse> from register', async () => {
      const registerDto: RegisterDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      authService.register.mockResolvedValue(mockRegisterResponse as any);

      const result = await controller.register(registerDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('message');
      expect(result.user).toEqual(mockUser);
      expect(typeof result.access_token).toBe('string');
      expect(typeof result.message).toBe('string');
    });
  });
});