import { jest } from '@jest/globals';
import { Types } from 'mongoose';

export const createMongooseModelMock = () => ({
  new: jest.fn().mockImplementation((data: any) => ({
    ...(data || {}),
    _id: new Types.ObjectId(),
    save: jest.fn().mockImplementation(() => Promise.resolve(data || {})),
  })),
  constructor: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  findOneAndUpdate: jest.fn(),
  create: jest.fn(),
  updateOne: jest.fn(),
  updateMany: jest.fn(),
  deleteOne: jest.fn(),
  deleteMany: jest.fn(),
  countDocuments: jest.fn(),
  aggregate: jest.fn(),
  populate: jest.fn(),
  exec: jest.fn(),
  lean: jest.fn(),
  select: jest.fn(),
  sort: jest.fn(),
  skip: jest.fn(),
  limit: jest.fn(),
  save: jest.fn(),
  schema: {
    paths: {},
  },
});

export const createQueryMock = () => ({
  exec: jest.fn(),
  lean: jest.fn().mockReturnThis(),
  populate: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  equals: jest.fn().mockReturnThis(),
  ne: jest.fn().mockReturnThis(),
  gt: jest.fn().mockReturnThis(),
  gte: jest.fn().mockReturnThis(),
  lt: jest.fn().mockReturnThis(),
  lte: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  nin: jest.fn().mockReturnThis(),
  regex: jest.fn().mockReturnThis(),
});

export const createDocumentMock = (data: any = {}) => ({
  ...(data || {}),
  _id: new Types.ObjectId(),
  save: jest.fn().mockImplementation(() => Promise.resolve(data || {})),
  remove: jest.fn().mockImplementation(() => Promise.resolve(data || {})),
  deleteOne: jest.fn().mockImplementation(() => Promise.resolve({ acknowledged: true, deletedCount: 1 })),
  populate: jest.fn().mockImplementation(() => Promise.resolve(data || {})),
  toJSON: jest.fn().mockImplementation(() => data || {}),
  toObject: jest.fn().mockImplementation(() => data || {}),
});

export const mockMongooseConnection = () => ({
  connection: {
    readyState: 1,
    on: jest.fn(),
    once: jest.fn(),
  },
});

export type MockMongooseModel = ReturnType<typeof createMongooseModelMock>;
export type MockQuery = ReturnType<typeof createQueryMock>;
export type MockDocument = ReturnType<typeof createDocumentMock>;