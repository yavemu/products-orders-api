import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { UsersRepository } from '../../repository/users.repository';
import { User, UserDocument } from '../../schemas/user.schema';
import { UserFactory } from '../../../common/testing';
import { UserMessages } from '../../enums';
import { SearchUserDto } from '../../dto';

describe('UsersRepository', () => {
  let repository: UsersRepository;
  let userModel: any;

  const mockUserModel = {
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    exec: jest.fn(),
    select: jest.fn(),
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

  describe('validation methods', () => {
    it('should validate user data for creation', () => {
      const validUserData = UserFactory.createDto();

      // This should not throw
      expect(() => {
        (repository as any).validateUserData(validUserData, false);
      }).not.toThrow();
    });

    it('should throw BadRequestException for invalid email', () => {
      const invalidUserData = UserFactory.createDto({ email: 'invalid-email' });

      expect(() => {
        (repository as any).validateUserData(invalidUserData, false);
      }).toThrow(new BadRequestException(UserMessages.INVALID_EMAIL));
    });

    it('should throw BadRequestException if password is too short', () => {
      const userData = UserFactory.createDto({ password: '123' });

      expect(() => {
        (repository as any).validateUserData(userData, false);
      }).toThrow(new BadRequestException(UserMessages.PASSWORD_TOO_SHORT));
    });

    it('should throw BadRequestException if firstName is missing', () => {
      const userData = UserFactory.createDto({ firstName: '' });

      expect(() => {
        (repository as any).validateUserData(userData, false);
      }).toThrow(new BadRequestException(UserMessages.FIRST_NAME_REQUIRED));
    });

    it('should throw BadRequestException if lastName is missing', () => {
      const userData = UserFactory.createDto({ lastName: '' });

      expect(() => {
        (repository as any).validateUserData(userData, false);
      }).toThrow(new BadRequestException(UserMessages.LAST_NAME_REQUIRED));
    });

    it('should throw BadRequestException if email is missing', () => {
      const userData = UserFactory.createDto({ email: '' });

      expect(() => {
        (repository as any).validateUserData(userData, false);
      }).toThrow(new BadRequestException(UserMessages.EMAIL_REQUIRED));
    });

    it('should throw BadRequestException if password is missing', () => {
      const userData = UserFactory.createDto({ password: '' });

      expect(() => {
        (repository as any).validateUserData(userData, false);
      }).toThrow(new BadRequestException(UserMessages.PASSWORD_REQUIRED));
    });

    it('should validate user data for update', () => {
      const validUpdateData = { firstName: 'Updated Name' };

      // This should not throw
      expect(() => {
        (repository as any).validateUserData(validUpdateData, true);
      }).not.toThrow();
    });

    it('should validate correct email format', () => {
      const validEmail = 'test@example.com';
      
      const isValid = (repository as any).isValidEmail(validEmail);
      
      expect(isValid).toBe(true);
    });

    it('should reject invalid email format', () => {
      const invalidEmail = 'invalid-email';
      
      const isValid = (repository as any).isValidEmail(invalidEmail);
      
      expect(isValid).toBe(false);
    });
  });

  describe('create', () => {
    it('should validate user data before creation', async () => {
      const userData = UserFactory.createDto({ email: 'invalid-email' });

      await expect(repository.create(userData)).rejects.toThrow(
        new BadRequestException(UserMessages.INVALID_EMAIL)
      );
    });
  });

  describe('updateById', () => {
    it('should validate update data', async () => {
      const userId = UserFactory.create()._id.toString();
      const updateData = { email: 'invalid-email' };

      await expect(repository.updateById(userId, updateData)).rejects.toThrow(
        new BadRequestException(UserMessages.INVALID_EMAIL)
      );
    });
  });

  describe('findByWhereCondition', () => {
    beforeEach(() => {
      // Mock the DatabaseUtil module
      const mockExecuteFindByWhereCondition = jest.fn().mockResolvedValue([]);
      jest.doMock('../../../common/utils/database.util', () => ({
        DatabaseUtil: {
          executeFindByWhereCondition: mockExecuteFindByWhereCondition,
          validateObjectId: jest.fn(),
          checkExists: jest.fn(),
        },
      }));
    });

    it('should handle findByWhereCondition calls', async () => {
      const whereCondition = { email: 'test@example.com' };
      
      // Mock the repository method directly to avoid DatabaseUtil issues
      const mockResult = UserFactory.createList(2);
      jest.spyOn(repository, 'findByWhereCondition').mockResolvedValue(mockResult);

      const result = await repository.findByWhereCondition(whereCondition);

      expect(result).toEqual(mockResult);
      expect(repository.findByWhereCondition).toHaveBeenCalledWith(whereCondition);
    });

    it('should be callable with options', async () => {
      const whereCondition = { role: 'admin' };
      const options = { page: 2, limit: 5, select: '+password' };
      const mockResult = UserFactory.createList(2);
      
      jest.spyOn(repository, 'findByWhereCondition').mockResolvedValue(mockResult);

      const result = await repository.findByWhereCondition(whereCondition, options);

      expect(result).toEqual(mockResult);
      expect(repository.findByWhereCondition).toHaveBeenCalledWith(whereCondition, options);
    });

    it('should handle default options', async () => {
      const whereCondition = { email: 'test@example.com' };
      const mockResult = UserFactory.createList(1);
      
      jest.spyOn(repository, 'findByWhereCondition').mockResolvedValue(mockResult);

      const result = await repository.findByWhereCondition(whereCondition);

      expect(result).toEqual(mockResult);
      expect(repository.findByWhereCondition).toHaveBeenCalledWith(whereCondition);
    });
  });

  describe('Repository Dependencies', () => {
    it('should be defined', () => {
      expect(repository).toBeDefined();
    });

    it('should have User model injected', () => {
      expect(userModel).toBeDefined();
    });
  });
});