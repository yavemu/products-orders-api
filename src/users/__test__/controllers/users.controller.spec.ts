import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../../controllers/users.controller';
import { UsersService } from '../../services/users.service';
import { UserFactory, TestSetupUtil } from '../../../common/testing';
import {
  CreateUserDto,
  SearchUserDto,
  UpdateUserDto,
  UserResponseDto,
  DeleteUserResponseDto,
} from '../../dto';
import { PaginatedData } from '../../../common/interfaces';

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOneById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    search: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersService);
  });

  afterEach(() => {
    TestSetupUtil.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = UserFactory.createDto();
      const expectedResult: UserResponseDto = UserFactory.createResponseDto();

      service.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createUserDto);

      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(expectedResult);
    });

    it('should handle service errors', async () => {
      const createUserDto: CreateUserDto = UserFactory.createDto();
      const error = new Error('Service error');

      service.create.mockRejectedValue(error);

      await expect(controller.create(createUserDto)).rejects.toThrow(error);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated list of all users', async () => {
      const expectedResult: PaginatedData<UserResponseDto> = {
        data: UserFactory.createResponseDtoList(3),
        meta: {
          page: 1,
          limit: 10,
          total: 3,
          totalPages: 1,
        },
      };

      service.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });

    it('should return empty list when no users exist', async () => {
      const expectedResult: PaginatedData<UserResponseDto> = {
        data: [],
        meta: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      };

      service.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('search', () => {
    it('should search users with filters', async () => {
      const searchDto: SearchUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        page: 1,
        limit: 10,
      };

      const expectedResult: PaginatedData<UserResponseDto> = {
        data: UserFactory.createResponseDtoList(2),
        meta: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      };

      service.search.mockResolvedValue(expectedResult);

      const result = await controller.search(searchDto);

      expect(service.search).toHaveBeenCalledWith(searchDto);
      expect(result).toEqual(expectedResult);
    });

    it('should handle search with partial filters', async () => {
      const searchDto: SearchUserDto = {
        firstName: 'John',
      };

      const expectedResult: PaginatedData<UserResponseDto> = {
        data: UserFactory.createResponseDtoList(1),
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      service.search.mockResolvedValue(expectedResult);

      const result = await controller.search(searchDto);

      expect(service.search).toHaveBeenCalledWith(searchDto);
      expect(result).toEqual(expectedResult);
    });

    it('should return empty results when no matches found', async () => {
      const searchDto: SearchUserDto = {
        firstName: 'Nonexistent',
      };

      const expectedResult: PaginatedData<UserResponseDto> = {
        data: [],
        meta: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      };

      service.search.mockResolvedValue(expectedResult);

      const result = await controller.search(searchDto);

      expect(service.search).toHaveBeenCalledWith(searchDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const userId = 'user-id-123';
      const expectedResult: UserResponseDto = UserFactory.createResponseDto();

      service.findOneById.mockResolvedValue(expectedResult);

      const result = await controller.findOne(userId);

      expect(service.findOneById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedResult);
    });

    it('should handle service errors when user not found', async () => {
      const userId = 'nonexistent-id';
      const error = new Error('User not found');

      service.findOneById.mockRejectedValue(error);

      await expect(controller.findOne(userId)).rejects.toThrow(error);
      expect(service.findOneById).toHaveBeenCalledWith(userId);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const userId = 'user-id-123';
      const updateUserDto: UpdateUserDto = {
        firstName: 'Updated Name',
        lastName: 'Updated Last',
      };
      const expectedResult: UserResponseDto = UserFactory.createResponseDto({
        firstName: 'Updated Name',
        lastName: 'Updated Last',
      });

      service.update.mockResolvedValue(expectedResult);

      const result = await controller.update(userId, updateUserDto);

      expect(service.update).toHaveBeenCalledWith(userId, updateUserDto);
      expect(result).toEqual(expectedResult);
    });

    it('should handle partial updates', async () => {
      const userId = 'user-id-123';
      const updateUserDto: UpdateUserDto = {
        firstName: 'Only First Name Updated',
      };
      const expectedResult: UserResponseDto = UserFactory.createResponseDto({
        firstName: 'Only First Name Updated',
      });

      service.update.mockResolvedValue(expectedResult);

      const result = await controller.update(userId, updateUserDto);

      expect(service.update).toHaveBeenCalledWith(userId, updateUserDto);
      expect(result).toEqual(expectedResult);
    });

    it('should handle service errors during update', async () => {
      const userId = 'user-id-123';
      const updateUserDto: UpdateUserDto = { firstName: 'Updated' };
      const error = new Error('Update failed');

      service.update.mockRejectedValue(error);

      await expect(controller.update(userId, updateUserDto)).rejects.toThrow(error);
      expect(service.update).toHaveBeenCalledWith(userId, updateUserDto);
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      const userId = 'user-id-123';
      const expectedResult: DeleteUserResponseDto = {
        message: 'Usuario eliminado exitosamente',
      };

      service.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove(userId);

      expect(service.remove).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedResult);
    });

    it('should handle service errors during deletion', async () => {
      const userId = 'nonexistent-id';
      const error = new Error('User not found');

      service.remove.mockRejectedValue(error);

      await expect(controller.remove(userId)).rejects.toThrow(error);
      expect(service.remove).toHaveBeenCalledWith(userId);
    });
  });

  describe('Controller Dependencies', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have UsersService injected', () => {
      expect(service).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should propagate service errors in create operation', async () => {
      const createUserDto: CreateUserDto = UserFactory.createDto();
      const error = new Error('Database connection failed');

      service.create.mockRejectedValue(error);

      await expect(controller.create(createUserDto)).rejects.toThrow(error);
    });

    it('should propagate service errors in search operation', async () => {
      const searchDto: SearchUserDto = { firstName: 'John' };
      const error = new Error('Search service unavailable');

      service.search.mockRejectedValue(error);

      await expect(controller.search(searchDto)).rejects.toThrow(error);
    });
  });

  describe('Input Validation', () => {
    it('should accept valid CreateUserDto', async () => {
      const createUserDto: CreateUserDto = UserFactory.createDto({
        firstName: 'Valid',
        lastName: 'User',
        email: 'valid@example.com',
        password: 'validPassword123',
      });
      const expectedResult: UserResponseDto = UserFactory.createResponseDto();

      service.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createUserDto);

      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(expectedResult);
    });

    it('should accept valid UpdateUserDto with optional fields', async () => {
      const userId = 'user-id-123';
      const updateUserDto: UpdateUserDto = {
        firstName: 'Updated',
      };
      const expectedResult: UserResponseDto = UserFactory.createResponseDto();

      service.update.mockResolvedValue(expectedResult);

      const result = await controller.update(userId, updateUserDto);

      expect(service.update).toHaveBeenCalledWith(userId, updateUserDto);
      expect(result).toEqual(expectedResult);
    });

    it('should accept valid SearchUserDto with optional filters', async () => {
      const searchDto: SearchUserDto = {};
      const expectedResult: PaginatedData<UserResponseDto> = {
        data: [],
        meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
      };

      service.search.mockResolvedValue(expectedResult);

      const result = await controller.search(searchDto);

      expect(service.search).toHaveBeenCalledWith(searchDto);
      expect(result).toEqual(expectedResult);
    });
  });
});
