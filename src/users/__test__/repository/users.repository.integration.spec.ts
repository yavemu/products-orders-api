import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { UsersRepository } from '../../repository/users.repository';
import { User, UserDocument } from '../../schemas/user.schema';
import { UserFactory } from '../../../common/testing';
import { UserMessages } from '../../enums';
import { SearchUserDto } from '../../dto';

describe('UsersRepository - Integration Tests', () => {
  let repository: UsersRepository;
  let userModel: any;

  const createMockQuery = () => ({
    select: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  });

  const mockUserModel = {
    findByIdAndUpdate: jest.fn().mockReturnValue(createMockQuery()),
    findByIdAndDelete: jest.fn().mockReturnValue(createMockQuery()),
    findOne: jest.fn().mockReturnValue(createMockQuery()),
    find: jest.fn().mockReturnValue(createMockQuery()),
    countDocuments: jest.fn().mockReturnValue(createMockQuery()),
    create: jest.fn(),
    save: jest.fn(),
    schema: {
      paths: {},
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRepository,
        {
          provide: getModelToken('User'),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    repository = module.get<UsersRepository>(UsersRepository);
    userModel = module.get(getModelToken('User'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create - detailed scenarios', () => {
    it('should successfully create and save a user', async () => {
      const userData = UserFactory.createDto();
      const mockUser = UserFactory.create(userData);
      const mockUserDocument = {
        ...mockUser,
        save: jest.fn().mockResolvedValue(mockUser),
      };

      repository.findByWhereCondition = jest.fn().mockResolvedValue(null);
      
      // Mock the constructor function properly
      const MockedModel = jest.fn().mockImplementation(() => mockUserDocument);
      Object.assign(MockedModel, userModel);
      repository['userModel'] = MockedModel as any;

      const result = await repository.create(userData);

      expect(repository.findByWhereCondition).toHaveBeenCalledWith({ email: userData.email });
      expect(MockedModel).toHaveBeenCalledWith(userData);
      expect(mockUserDocument.save).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should handle user creation with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      repository.findByWhereCondition = jest.fn().mockResolvedValue(null);
      const mockUser = UserFactory.create(userData);
      const mockUserDocument = {
        ...mockUser,
        save: jest.fn().mockResolvedValue(mockUser),
      };

      const MockedModel = jest.fn().mockImplementation(() => mockUserDocument);
      Object.assign(MockedModel, userModel);
      repository['userModel'] = MockedModel as any;

      const result = await repository.create(userData);

      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll - implementation details', () => {
    it('should call findByWhereCondition for finding all users', async () => {
      const mockUsers = UserFactory.createList(5);
      
      // Mock the underlying database operations for findByWhereCondition
      userModel.find().exec.mockResolvedValue(mockUsers);

      const result = await repository.findAll();

      expect(result).toEqual(mockUsers);
    });
  });

  describe('findOneById - edge cases', () => {
    it('should validate ObjectId and throw error for invalid format', async () => {
      const invalidId = 'invalid-id';

      await expect(repository.findOneById(invalidId)).rejects.toThrow(
        'ID de usuario inválido'
      );
    });

    it('should find user by valid ObjectId', async () => {
      const userId = UserFactory.create()._id.toString();
      const mockUser = UserFactory.create();

      repository.findByWhereCondition = jest.fn().mockResolvedValue(mockUser);

      const result = await repository.findOneById(userId);

      expect(repository.findByWhereCondition).toHaveBeenCalledWith({ _id: userId });
      expect(result).toEqual(mockUser);
    });
  });

  describe('search - comprehensive testing', () => {
    it('should perform search with all filters', async () => {
      const searchDto: SearchUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        page: 2,
        limit: 5,
      };

      const mockUsers = UserFactory.createList(5);
      const mockResult = {
        data: mockUsers,
        total: 15,
        page: 2,
        limit: 5,
        totalPages: 3,
      };

      // Mock the underlying database operations
      userModel.find().exec.mockResolvedValue(mockUsers);
      userModel.countDocuments().exec.mockResolvedValue(15);

      const result = await repository.search(searchDto);

      expect(result.data).toBeDefined();
      expect(result.page).toBe(2);
      expect(result.limit).toBe(5);
    });
  });

  describe('validateCredentials - authentication scenarios', () => {
    it('should return user for valid credentials', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const mockUser = {
        ...UserFactory.create({ email }),
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      repository.findByWhereCondition = jest.fn().mockResolvedValue(mockUser);

      const result = await repository.validateCredentials(email, password);

      expect(repository.findByWhereCondition).toHaveBeenCalledWith(
        { email },
        { select: '+password' }
      );
      expect(mockUser.comparePassword).toHaveBeenCalledWith(password);
      expect(result).toEqual(mockUser);
    });

    it('should return null for non-existent user', async () => {
      const email = 'nonexistent@example.com';
      const password = 'password123';

      repository.findByWhereCondition = jest.fn().mockResolvedValue(null);

      const result = await repository.validateCredentials(email, password);

      expect(result).toBeNull();
    });

    it('should return null for incorrect password', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';
      const mockUser = {
        ...UserFactory.create({ email }),
        comparePassword: jest.fn().mockResolvedValue(false),
      };

      repository.findByWhereCondition = jest.fn().mockResolvedValue(mockUser);

      const result = await repository.validateCredentials(email, password);

      expect(mockUser.comparePassword).toHaveBeenCalledWith(password);
      expect(result).toBeNull();
    });
  });

  describe('updateById - comprehensive scenarios', () => {
    it('should update user with valid data', async () => {
      const userId = UserFactory.create()._id.toString();
      const updateData = { firstName: 'Updated', lastName: 'User' };
      const updatedUser = UserFactory.create({ ...updateData });

      // Mock the chain of operations
      userModel.findOne().exec.mockResolvedValue(updatedUser); // for checkExists
      userModel.findByIdAndUpdate().select().exec.mockResolvedValue(updatedUser);

      const result = await repository.updateById(userId, updateData);

      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(userId, updateData, { new: true });
      expect(result).toEqual(updatedUser);
    });

    it('should validate update data before updating', async () => {
      const userId = UserFactory.create()._id.toString();
      const invalidUpdateData = { email: 'invalid-email' };

      await expect(repository.updateById(userId, invalidUpdateData)).rejects.toThrow(
        new BadRequestException(UserMessages.INVALID_EMAIL)
      );
    });
  });

  describe('deleteById - comprehensive scenarios', () => {
    it('should delete user successfully', async () => {
      const userId = UserFactory.create()._id.toString();
      const mockUser = UserFactory.create();

      // Mock the chain of operations
      userModel.findOne().exec.mockResolvedValue(mockUser); // for checkExists
      userModel.findByIdAndDelete().exec.mockResolvedValue({});

      const result = await repository.deleteById(userId);

      expect(userModel.findByIdAndDelete).toHaveBeenCalledWith(userId);
      expect(result).toEqual({ message: UserMessages.DELETED_SUCCESS });
    });
  });

  describe('Error handling scenarios', () => {
    it('should handle database errors gracefully', async () => {
      const userData = UserFactory.createDto();
      
      repository.findByWhereCondition = jest.fn().mockRejectedValue(new Error('Database error'));

      await expect(repository.create(userData)).rejects.toThrow('Database error');
    });
  });
});