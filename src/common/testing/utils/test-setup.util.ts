import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { createMongooseModelMock } from '../mocks';

export interface TestModuleConfig {
  controllers?: any[];
  providers?: any[];
  imports?: any[];
  mockModels?: string[];
}

export class TestSetupUtil {
  /**
   * Configura un módulo de testing básico con mocks comunes
   */
  static async createTestingModule(config: TestModuleConfig): Promise<TestingModule> {
    const { controllers = [], providers = [], imports = [], mockModels = [] } = config;

    const mockProviders = [
      ...providers,
      {
        provide: JwtService,
        useValue: {
          sign: jest.fn().mockReturnValue('mock-jwt-token'),
          verify: jest.fn().mockReturnValue({ sub: 'user-id', email: 'test@test.com' }),
        },
      },
      {
        provide: ConfigService,
        useValue: {
          get: jest.fn().mockImplementation((key: string) => {
            const config = {
              JWT_SECRET: 'test-secret',
              JWT_EXPIRES_IN: '1h',
              DATABASE_URI: 'mongodb://test',
            };
            return config[key];
          }),
        },
      },
      // Mock mongoose models
      ...mockModels.map(modelName => ({
        provide: getModelToken(modelName),
        useValue: createMongooseModelMock(),
      })),
    ];

    const moduleRef = await Test.createTestingModule({
      controllers,
      providers: mockProviders,
      imports,
    }).compile();

    return moduleRef;
  }

  /**
   * Configura mocks para un repositorio específico
   */
  static setupRepositoryMocks(moduleRef: TestingModule, repositoryClass: any, mockMethods: any) {
    const repository = moduleRef.get(repositoryClass);
    Object.keys(mockMethods).forEach(method => {
      repository[method] = mockMethods[method];
    });
    return repository;
  }

  /**
   * Configura mocks para un servicio específico
   */
  static setupServiceMocks(moduleRef: TestingModule, serviceClass: any, mockMethods: any) {
    const service = moduleRef.get(serviceClass);
    Object.keys(mockMethods).forEach(method => {
      service[method] = mockMethods[method];
    });
    return service;
  }

  /**
   * Limpia todos los mocks después de cada test
   */
  static clearAllMocks() {
    jest.clearAllMocks();
  }

  /**
   * Verifica que un mock haya sido llamado con parámetros específicos
   */
  static expectMockCalledWith(mockFn: jest.Mock, ...args: any[]) {
    expect(mockFn).toHaveBeenCalledWith(...args);
  }

  /**
   * Verifica que un mock haya sido llamado un número específico de veces
   */
  static expectMockCalledTimes(mockFn: jest.Mock, times: number) {
    expect(mockFn).toHaveBeenCalledTimes(times);
  }

  /**
   * Crea un mock de request para testing de controladores
   */
  static createMockRequest(overrides: any = {}) {
    return {
      user: { id: 'user-id', email: 'test@test.com', role: 'client' },
      body: {},
      params: {},
      query: {},
      headers: {},
      ...overrides,
    };
  }

  /**
   * Crea un mock de response para testing de controladores
   */
  static createMockResponse() {
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis(),
    };
    return response;
  }

  /**
   * Crea un matcher personalizado para validar errores
   */
  static expectErrorWithMessage(error: any, expectedMessage: string, expectedStatus?: number) {
    expect(error).toBeDefined();
    expect(error.message).toBe(expectedMessage);
    if (expectedStatus) {
      expect(error.status || error.statusCode).toBe(expectedStatus);
    }
  }

  /**
   * Crea datos de paginación mock
   */
  static createMockPaginatedData<T>(data: T[], meta: any = {}) {
    return {
      data,
      meta: {
        page: 1,
        limit: 10,
        total: data.length,
        totalPages: Math.ceil(data.length / 10),
        ...meta,
      },
    };
  }
}