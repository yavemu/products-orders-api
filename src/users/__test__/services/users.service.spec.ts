import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../services/users.service';
import { UsersRepository } from '../../repository/users.repository';
import { UserFactory } from '../../../common/testing';
import { CreateUserDto, SearchUserDto, UpdateUserDto } from '../../dto';
import { HttpResponseUtil } from '../../../common/utils';
import { User } from '../../schemas/user.schema';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<UsersRepository>;

  const mockRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOneById: jest.fn(),
    updateById: jest.fn(),
    deleteById: jest.fn(),
    search: jest.fn(),
    validateCredentials: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(UsersRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a user and return UserResponseDto', async () => {
      const createUserDto: CreateUserDto = UserFactory.createDto();
      const mockUser = UserFactory.create(createUserDto);
      
      repository.create.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(repository.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual({
        _id: mockUser._id.toString(),
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        email: mockUser.email,
        role: mockUser.role,
        fullName: `${mockUser.firstName} ${mockUser.lastName}`,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated list of users', async () => {
      const mockUsers = UserFactory.createList(3);
      repository.findAll.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(repository.findAll).toHaveBeenCalled();
      expect(result).toEqual(HttpResponseUtil.createListResponse(
        mockUsers.map(user => ({
          _id: user._id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          fullName: `${user.firstName} ${user.lastName}`,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        }))
      ));
    });

    it('should return empty paginated list when no users exist', async () => {
      repository.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(repository.findAll).toHaveBeenCalled();
      expect(result).toEqual(HttpResponseUtil.createListResponse([]));
    });
  });

  describe('findOneById', () => {
    it('should return a user by id', async () => {
      const mockUser = UserFactory.create();
      repository.findOneById.mockResolvedValue(mockUser);

      const result = await service.findOneById(mockUser._id.toString());

      expect(repository.findOneById).toHaveBeenCalledWith(mockUser._id.toString());
      expect(result).toEqual({
        _id: mockUser._id.toString(),
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        email: mockUser.email,
        role: mockUser.role,
        fullName: `${mockUser.firstName} ${mockUser.lastName}`,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
    });
  });

  describe('update', () => {
    it('should update a user and return UserResponseDto', async () => {
      const userId = UserFactory.create()._id.toString();
      const updateUserDto: UpdateUserDto = {
        firstName: 'Updated Name',
        lastName: 'Updated Last',
      };
      const updatedUser = UserFactory.create({ 
        ...updateUserDto,
        _id: userId as any 
      });

      repository.updateById.mockResolvedValue(updatedUser);

      const result = await service.update(userId, updateUserDto);

      expect(repository.updateById).toHaveBeenCalledWith(userId, updateUserDto);
      expect(result).toEqual({
        _id: updatedUser._id.toString(),
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        role: updatedUser.role,
        fullName: `${updatedUser.firstName} ${updatedUser.lastName}`,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      });
    });
  });

  describe('remove', () => {
    it('should delete a user and return DeleteUserResponseDto', async () => {
      const userId = UserFactory.create()._id.toString();
      const mockResponse = { message: 'Usuario eliminado exitosamente' };
      
      repository.deleteById.mockResolvedValue(mockResponse);

      const result = await service.remove(userId);

      expect(repository.deleteById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('search', () => {
    it('should search users and return paginated results', async () => {
      const searchDto: SearchUserDto = {
        firstName: 'John',
        page: 1,
        limit: 10,
      };
      const mockUsers = UserFactory.createList(2);
      const mockSearchResult = {
        data: mockUsers,
        meta: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      };

      repository.search.mockResolvedValue(mockSearchResult);
      jest.spyOn(HttpResponseUtil, 'processPaginatedResult').mockReturnValue({
        data: mockUsers.map(user => ({
          _id: user._id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          fullName: `${user.firstName} ${user.lastName}`,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        })),
        meta: mockSearchResult.meta,
      });

      const result = await service.search(searchDto);

      expect(repository.search).toHaveBeenCalledWith(searchDto);
      expect(HttpResponseUtil.processPaginatedResult).toHaveBeenCalledWith(
        mockSearchResult,
        expect.any(Function)
      );
      expect(result.data).toHaveLength(2);
      expect(result.meta).toEqual(mockSearchResult.meta);
    });
  });

  describe('validateCredentials', () => {
    it('should validate user credentials and return user', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const mockUser = UserFactory.create({ email });

      repository.validateCredentials.mockResolvedValue(mockUser);

      const result = await service.validateCredentials(email, password);

      expect(repository.validateCredentials).toHaveBeenCalledWith(email, password);
      expect(result).toEqual(mockUser);
    });

    it('should return null for invalid credentials', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';

      repository.validateCredentials.mockResolvedValue(null);

      const result = await service.validateCredentials(email, password);

      expect(repository.validateCredentials).toHaveBeenCalledWith(email, password);
      expect(result).toBeNull();
    });
  });

  describe('createForAuth', () => {
    it('should create user for authentication and return User entity', async () => {
      const createUserDto: CreateUserDto = UserFactory.createDto();
      const mockUser = UserFactory.create(createUserDto);

      repository.create.mockResolvedValue(mockUser);

      const result = await service.createForAuth(createUserDto);

      expect(repository.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('mapToDto', () => {
    it('should map User entity to UserResponseDto', async () => {
      const mockUser = UserFactory.create();
      
      // Using create method to test mapToDto indirectly
      repository.create.mockResolvedValue(mockUser);
      
      const result = await service.create(UserFactory.createDto());

      expect(result).toEqual({
        _id: mockUser._id.toString(),
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        email: mockUser.email,
        role: mockUser.role,
        fullName: `${mockUser.firstName} ${mockUser.lastName}`,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
    });
  });
});