import { jest } from '@jest/globals';

export const createServiceMock = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  findOneById: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  search: jest.fn(),
});

export const createUserServiceMock = () => ({
  ...createServiceMock(),
  findByEmail: jest.fn(),
  updatePassword: jest.fn(),
  validateUser: jest.fn(),
});

export const createProductServiceMock = () => ({
  ...createServiceMock(),
  findBySku: jest.fn(),
  uploadImage: jest.fn(),
  validateSku: jest.fn(),
});

export const createOrderServiceMock = () => ({
  ...createServiceMock(),
  generateReports: jest.fn(),
  calculateTotal: jest.fn(),
  validateProducts: jest.fn(),
  updateStatus: jest.fn(),
});

export const createAuthServiceMock = () => ({
  login: jest.fn(),
  register: jest.fn(),
  validateUser: jest.fn(),
  generateToken: jest.fn(),
  hashPassword: jest.fn(),
  comparePasswords: jest.fn(),
});

export type MockService = ReturnType<typeof createServiceMock>;
export type MockUserService = ReturnType<typeof createUserServiceMock>;
export type MockProductService = ReturnType<typeof createProductServiceMock>;
export type MockOrderService = ReturnType<typeof createOrderServiceMock>;
export type MockAuthService = ReturnType<typeof createAuthServiceMock>;