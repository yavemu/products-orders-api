import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ProductsController } from '../../controllers/products.controller';
import { ProductsService } from '../../services/products.service';
import { ProductFactory } from '../../../common/testing/factories/product.factory';
import { CreateProductDto, UpdateProductDto, SearchProductDto } from '../../dto';
import { ProductMessages } from '../../enums';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: jest.Mocked<ProductsService>;

  const mockProduct = ProductFactory.create();
  const mockProductResponse = ProductFactory.createResponseDto(mockProduct);

  const mockService = {
    create: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    search: jest.fn(),
    createWithFile: jest.fn(),
    updateWithFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createProductDto: CreateProductDto = ProductFactory.createDto();
    const mockFile = {
      path: '/uploads/product.jpg',
      filename: 'product.jpg',
      originalname: 'product.jpg',
      mimetype: 'image/jpeg',
      size: 1024,
    } as Express.Multer.File;

    it('should create a product with file successfully', async () => {
      service.createWithFile.mockResolvedValue(mockProductResponse as any);

      const result = await controller.create(mockFile, createProductDto);

      expect(service.createWithFile).toHaveBeenCalledWith(createProductDto, mockFile);
      expect(result).toEqual(mockProductResponse);
    });

    it('should handle service errors', async () => {
      service.createWithFile.mockRejectedValue(new BadRequestException(ProductMessages.PICTURE_REQUIRED));

      await expect(controller.create(null as any, createProductDto)).rejects.toThrow(
        new BadRequestException(ProductMessages.PICTURE_REQUIRED)
      );
    });

    it('should pass file and DTO correctly to service', async () => {
      service.createWithFile.mockResolvedValue(mockProductResponse as any);

      await controller.create(mockFile, createProductDto);

      expect(service.createWithFile).toHaveBeenCalledWith(createProductDto, mockFile);
      expect(service.createWithFile).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      const mockProducts = ProductFactory.createMany(3).map(p => ProductFactory.createResponseDto(p));
      const mockResponse = {
        data: mockProducts,
        meta: {
          total: 3,
          page: 1,
          limit: 10,
          totalPages: 1,
        }
      };

      service.findAll.mockResolvedValue(mockResponse as any);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
      expect(result.data).toHaveLength(3);
    });

    it('should handle service errors', async () => {
      service.findAll.mockRejectedValue(new Error('Database error'));

      await expect(controller.findAll()).rejects.toThrow('Database error');
    });
  });

  describe('search', () => {
    const searchDto: SearchProductDto = ProductFactory.createSearchDto();

    it('should search products successfully', async () => {
      const mockSearchResult = {
        data: ProductFactory.createMany(2).map(p => ProductFactory.createResponseDto(p)),
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        }
      };

      service.search.mockResolvedValue(mockSearchResult as any);

      const result = await controller.search(searchDto);

      expect(service.search).toHaveBeenCalledWith(searchDto);
      expect(result).toEqual(mockSearchResult);
      expect(result.data).toHaveLength(2);
    });

    it('should handle service errors', async () => {
      service.search.mockRejectedValue(new Error('Search failed'));

      await expect(controller.search(searchDto)).rejects.toThrow('Search failed');
    });

    it('should pass search parameters correctly', async () => {
      const customSearchDto: SearchProductDto = {
        name: 'Test Product',
        sku: 'TEST-123',
        minPrice: 100,
        maxPrice: 500,
        page: 2,
        limit: 5,
      };

      service.search.mockResolvedValue({
        data: [],
        meta: { total: 0, page: 2, limit: 5, totalPages: 0 }
      } as any);

      await controller.search(customSearchDto);

      expect(service.search).toHaveBeenCalledWith(customSearchDto);
    });
  });

  describe('findOne', () => {
    const productId = mockProduct._id.toString();

    it('should find a product by ID', async () => {
      service.findOne.mockResolvedValue(mockProductResponse as any);

      const result = await controller.findOne(productId);

      expect(service.findOne).toHaveBeenCalledWith(productId);
      expect(result).toEqual(mockProductResponse);
    });

    it('should handle not found errors', async () => {
      service.findOne.mockRejectedValue(new NotFoundException(ProductMessages.NOT_FOUND));

      await expect(controller.findOne(productId)).rejects.toThrow(
        new NotFoundException(ProductMessages.NOT_FOUND)
      );
    });

    it('should handle invalid ID errors', async () => {
      const invalidId = 'invalid-id';
      service.findOne.mockRejectedValue(new BadRequestException('Invalid ID'));

      await expect(controller.findOne(invalidId)).rejects.toThrow(
        new BadRequestException('Invalid ID')
      );
    });
  });

  describe('update', () => {
    const productId = mockProduct._id.toString();
    const updateProductDto: UpdateProductDto = ProductFactory.createUpdateDto();
    const mockFile = {
      path: '/uploads/updated-product.jpg',
      filename: 'updated-product.jpg',
      originalname: 'updated-product.jpg',
      mimetype: 'image/jpeg',
      size: 2048,
    } as Express.Multer.File;

    it('should update a product with file successfully', async () => {
      const updatedProductResponse = { ...mockProductResponse, ...updateProductDto };
      service.updateWithFile.mockResolvedValue(updatedProductResponse as any);

      const result = await controller.update(productId, mockFile, updateProductDto);

      expect(service.updateWithFile).toHaveBeenCalledWith(productId, updateProductDto, mockFile);
      expect(result).toEqual(updatedProductResponse);
    });

    it('should update a product without file', async () => {
      const updatedProductResponse = { ...mockProductResponse, ...updateProductDto };
      service.updateWithFile.mockResolvedValue(updatedProductResponse as any);

      const result = await controller.update(productId, undefined as any, updateProductDto);

      expect(service.updateWithFile).toHaveBeenCalledWith(productId, updateProductDto, undefined);
      expect(result).toEqual(updatedProductResponse);
    });

    it('should handle not found errors', async () => {
      service.updateWithFile.mockRejectedValue(new NotFoundException(ProductMessages.NOT_FOUND));

      await expect(controller.update(productId, mockFile, updateProductDto)).rejects.toThrow(
        new NotFoundException(ProductMessages.NOT_FOUND)
      );
    });

    it('should handle validation errors', async () => {
      service.updateWithFile.mockRejectedValue(new BadRequestException('Invalid update data'));

      await expect(controller.update(productId, mockFile, updateProductDto)).rejects.toThrow(
        new BadRequestException('Invalid update data')
      );
    });
  });

  describe('remove', () => {
    const productId = mockProduct._id.toString();

    it('should remove a product successfully', async () => {
      const deleteResponse = { message: ProductMessages.DELETED_SUCCESS };
      service.remove.mockResolvedValue(deleteResponse as any);

      const result = await controller.remove(productId);

      expect(service.remove).toHaveBeenCalledWith(productId);
      expect(result).toEqual(deleteResponse);
    });

    it('should handle not found errors', async () => {
      service.remove.mockRejectedValue(new NotFoundException(ProductMessages.NOT_FOUND));

      await expect(controller.remove(productId)).rejects.toThrow(
        new NotFoundException(ProductMessages.NOT_FOUND)
      );
    });

    it('should handle invalid ID errors', async () => {
      const invalidId = 'invalid-id';
      service.remove.mockRejectedValue(new BadRequestException('Invalid ID'));

      await expect(controller.remove(invalidId)).rejects.toThrow(
        new BadRequestException('Invalid ID')
      );
    });
  });

  describe('dependency injection', () => {
    it('should inject ProductsService', () => {
      expect(controller['productsService']).toBeDefined();
      expect(controller['productsService']).toBe(service);
    });
  });

  describe('controller methods', () => {
    it('should have all required methods', () => {
      expect(controller.create).toBeDefined();
      expect(controller.findAll).toBeDefined();
      expect(controller.search).toBeDefined();
      expect(controller.findOne).toBeDefined();
      expect(controller.update).toBeDefined();
      expect(controller.remove).toBeDefined();
    });

    it('should have correct method signatures', () => {
      expect(typeof controller.create).toBe('function');
      expect(typeof controller.findAll).toBe('function');
      expect(typeof controller.search).toBe('function');
      expect(typeof controller.findOne).toBe('function');
      expect(typeof controller.update).toBe('function');
      expect(typeof controller.remove).toBe('function');
    });
  });

  describe('error handling', () => {
    it('should propagate service errors', async () => {
      const error = new Error('Service failure');
      service.findAll.mockRejectedValue(error);

      await expect(controller.findAll()).rejects.toThrow('Service failure');
    });

    it('should handle multiple types of errors', async () => {
      const badRequestError = new BadRequestException('Bad request');
      const notFoundError = new NotFoundException('Not found');
      const genericError = new Error('Generic error');

      service.findOne.mockRejectedValue(badRequestError);
      await expect(controller.findOne('invalid')).rejects.toThrow(badRequestError);

      service.findOne.mockRejectedValue(notFoundError);
      await expect(controller.findOne('notfound')).rejects.toThrow(notFoundError);

      service.findOne.mockRejectedValue(genericError);
      await expect(controller.findOne('error')).rejects.toThrow(genericError);
    });
  });

  describe('file upload handling', () => {
    it('should handle file upload in create', async () => {
      const createDto: CreateProductDto = ProductFactory.createDto();
      const file = {
        path: '/uploads/test.jpg',
        filename: 'test.jpg',
      } as Express.Multer.File;

      service.createWithFile.mockResolvedValue(mockProductResponse as any);

      await controller.create(file, createDto);

      expect(service.createWithFile).toHaveBeenCalledWith(createDto, file);
    });

    it('should handle file upload in update', async () => {
      const updateDto: UpdateProductDto = ProductFactory.createUpdateDto();
      const file = {
        path: '/uploads/updated.jpg',
        filename: 'updated.jpg',
      } as Express.Multer.File;
      const productId = 'test-id';

      service.updateWithFile.mockResolvedValue(mockProductResponse as any);

      await controller.update(productId, file, updateDto);

      expect(service.updateWithFile).toHaveBeenCalledWith(productId, updateDto, file);
    });
  });
});