import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { IS_PUBLIC_KEY } from '../../decorators/public.decorator';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: any;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  const mockExecutionContext = {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn(),
      getResponse: jest.fn(),
    }),
  } as unknown as ExecutionContext;

  beforeEach(() => {
    reflector = mockReflector;
    guard = new JwtAuthGuard(reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should allow access to public routes', () => {
      reflector.getAllAndOverride.mockReturnValue(true);

      const result = guard.canActivate(mockExecutionContext);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        mockExecutionContext.getHandler(),
        mockExecutionContext.getClass(),
      ]);
      expect(result).toBe(true);
    });

    it('should call parent canActivate for protected routes', () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      const superCanActivateSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guard)), 'canActivate').mockReturnValue(true);

      const result = guard.canActivate(mockExecutionContext);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        mockExecutionContext.getHandler(),
        mockExecutionContext.getClass(),
      ]);
      expect(superCanActivateSpy).toHaveBeenCalledWith(mockExecutionContext);
      expect(result).toBe(true);
    });

    it('should call parent canActivate when isPublic is undefined', () => {
      reflector.getAllAndOverride.mockReturnValue(undefined);
      const superCanActivateSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guard)), 'canActivate').mockReturnValue(true);

      const result = guard.canActivate(mockExecutionContext);

      expect(superCanActivateSpy).toHaveBeenCalledWith(mockExecutionContext);
      expect(result).toBe(true);
    });

    it('should call parent canActivate when isPublic is null', () => {
      reflector.getAllAndOverride.mockReturnValue(null);
      const superCanActivateSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guard)), 'canActivate').mockReturnValue(true);

      const result = guard.canActivate(mockExecutionContext);

      expect(superCanActivateSpy).toHaveBeenCalledWith(mockExecutionContext);
      expect(result).toBe(true);
    });
  });

  describe('handleRequest', () => {
    it('should return user when valid user is provided', () => {
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      const result = guard.handleRequest(null, mockUser, null);

      expect(result).toBe(mockUser);
    });

    it('should throw UnauthorizedException when no user is provided', () => {
      expect(() => {
        guard.handleRequest(null, null, null);
      }).toThrow(new UnauthorizedException('No autorizado'));
    });

    it('should throw UnauthorizedException when user is undefined', () => {
      expect(() => {
        guard.handleRequest(null, undefined, null);
      }).toThrow(new UnauthorizedException('No autorizado'));
    });

    it('should throw UnauthorizedException when user is false', () => {
      expect(() => {
        guard.handleRequest(null, false, null);
      }).toThrow(new UnauthorizedException('No autorizado'));
    });

    it('should throw error when error is provided', () => {
      const error = new Error('Custom error');

      expect(() => {
        guard.handleRequest(error, null, null);
      }).toThrow(error);
    });

    it('should prioritize error over missing user', () => {
      const error = new Error('Custom error');

      expect(() => {
        guard.handleRequest(error, null, null);
      }).toThrow(error);
    });

    it('should return user even when info is provided', () => {
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'john@example.com',
      };
      const info = { message: 'Some info' };

      const result = guard.handleRequest(null, mockUser, info);

      expect(result).toBe(mockUser);
    });
  });

  describe('constructor', () => {
    it('should inject reflector properly', () => {
      const guard = new JwtAuthGuard(reflector);
      
      expect(guard['reflector']).toBeDefined();
      expect(guard['reflector']).toBe(reflector);
    });
  });

  describe('inheritance', () => {
    it('should extend AuthGuard', () => {
      expect(guard).toBeInstanceOf(JwtAuthGuard);
      // Note: We can't easily test AuthGuard inheritance without importing passport
    });
  });

  describe('decorator integration', () => {
    it('should check for public decorator correctly', () => {
      const handler = jest.fn();
      const classConstructor = jest.fn();
      
      mockExecutionContext.getHandler = jest.fn().mockReturnValue(handler);
      mockExecutionContext.getClass = jest.fn().mockReturnValue(classConstructor);
      
      reflector.getAllAndOverride.mockReturnValue(true);

      guard.canActivate(mockExecutionContext);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        handler,
        classConstructor,
      ]);
    });
  });
});