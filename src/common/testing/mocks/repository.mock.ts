import { jest } from '@jest/globals';

export const createRepositoryMock = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOneById: jest.fn(),
  findOne: jest.fn(),
  updateById: jest.fn(),
  deleteById: jest.fn(),
  search: jest.fn(),
  count: jest.fn(),
  exists: jest.fn(),
  findByEmail: jest.fn(),
  findBySku: jest.fn(),
  findByIdentifier: jest.fn(),
  findOrdersForReports: jest.fn(),
  getOrdersSummary: jest.fn(),
});

export const createUserRepositoryMock = () => ({
  ...createRepositoryMock(),
  findByEmail: jest.fn(),
  updatePassword: jest.fn(),
  deactivateUser: jest.fn(),
});

export const createProductRepositoryMock = () => ({
  ...createRepositoryMock(),
  findBySku: jest.fn(),
  findActiveProducts: jest.fn(),
  deactivateProduct: jest.fn(),
});

export const createOrderRepositoryMock = () => ({
  ...createRepositoryMock(),
  findByIdentifier: jest.fn(),
  findByClientId: jest.fn(),
  findOrdersForReports: jest.fn(),
  getOrdersSummary: jest.fn(),
  calculateTotal: jest.fn(),
  validateProducts: jest.fn(),
});

export type MockRepository = ReturnType<typeof createRepositoryMock>;
export type MockUserRepository = ReturnType<typeof createUserRepositoryMock>;
export type MockProductRepository = ReturnType<typeof createProductRepositoryMock>;
export type MockOrderRepository = ReturnType<typeof createOrderRepositoryMock>;