import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ProductsService } from '../../services/products.service';
import { ProductsRepository } from '../../repository/products.repository';
import { ProductFactory } from '../../../common/testing/factories/product.factory';
import { ProductMessages } from '../../enums';
import { CreateProductDto, UpdateProductDto, SearchProductDto } from '../../dto';
import { HttpResponseUtil } from '../../../common/utils';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: jest.Mocked<ProductsRepository>;

  const mockProduct = ProductFactory.create();
  const mockProductResponse = ProductFactory.createResponseDto(mockProduct);

  const mockRepository = {
    create: jest.fn(),
    findOneById: jest.fn(),
    findAll: jest.fn(),
    updateById: jest.fn(),
    deleteById: jest.fn(),
    search: jest.fn(),
    findManyByIds: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: ProductsRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get(ProductsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a product successfully', async () => {
      const createProductDto = ProductFactory.createDto();
      repository.create.mockResolvedValue(mockProduct);

      const result = await service.create(createProductDto);

      expect(repository.create).toHaveBeenCalledWith(createProductDto);
      expect(result).toEqual({
        id: mockProduct._id.toString(),
        name: mockProduct.name,
        sku: mockProduct.sku,
        price: mockProduct.price,
        picture: mockProduct.picture,
        createdAt: mockProduct.createdAt,
        updatedAt: mockProduct.updatedAt,
      });
    });

    it('should handle repository errors', async () => {
      const createProductDto = ProductFactory.createDto();
      repository.create.mockRejectedValue(new Error('Repository error'));

      await expect(service.create(createProductDto)).rejects.toThrow('Repository error');
    });
  });

  describe('findOne', () => {
    it('should find a product by ID', async () => {
      const productId = mockProduct._id.toString();
      repository.findOneById.mockResolvedValue(mockProduct);

      const result = await service.findOne(productId);

      expect(repository.findOneById).toHaveBeenCalledWith(productId);
      expect(result).toEqual({
        id: mockProduct._id.toString(),
        name: mockProduct.name,
        sku: mockProduct.sku,
        price: mockProduct.price,
        picture: mockProduct.picture,
        createdAt: mockProduct.createdAt,
        updatedAt: mockProduct.updatedAt,
      });
    });

    it('should handle repository errors', async () => {
      const productId = mockProduct._id.toString();
      repository.findOneById.mockRejectedValue(new Error('Product not found'));

      await expect(service.findOne(productId)).rejects.toThrow('Product not found');
    });
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      const mockProducts = ProductFactory.createMany(3);
      repository.findAll.mockResolvedValue(mockProducts);

      jest.spyOn(HttpResponseUtil, 'createListResponse').mockReturnValue({
        data: mockProducts.map(p => ({
          id: p._id.toString(),
          name: p.name,
          sku: p.sku,
          price: p.price,
          picture: p.picture,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        })),
        meta: {
          total: mockProducts.length,
          page: 1,
          limit: 10,
          totalPages: 1,
        }
      } as any);

      const result = await service.findAll();

      expect(repository.findAll).toHaveBeenCalled();
      expect(HttpResponseUtil.createListResponse).toHaveBeenCalled();
      expect(result.data).toHaveLength(3);
    });
  });

  describe('update', () => {
    it('should update a product successfully', async () => {
      const productId = mockProduct._id.toString();
      const updateDto = ProductFactory.createUpdateDto();
      const updatedProduct = { ...mockProduct, ...updateDto };
      
      repository.updateById.mockResolvedValue(updatedProduct);

      const result = await service.update(productId, updateDto);

      expect(repository.updateById).toHaveBeenCalledWith(productId, updateDto);
      expect(result).toEqual({
        id: updatedProduct._id.toString(),
        name: updatedProduct.name,
        sku: updatedProduct.sku,
        price: updatedProduct.price,
        picture: updatedProduct.picture,
        createdAt: updatedProduct.createdAt,
        updatedAt: updatedProduct.updatedAt,
      });
    });

    it('should handle repository errors', async () => {
      const productId = mockProduct._id.toString();
      const updateDto = ProductFactory.createUpdateDto();
      repository.updateById.mockRejectedValue(new Error('Update failed'));

      await expect(service.update(productId, updateDto)).rejects.toThrow('Update failed');
    });
  });

  describe('remove', () => {
    it('should remove a product successfully', async () => {
      const productId = mockProduct._id.toString();
      const deleteResponse = { message: ProductMessages.DELETED_SUCCESS };
      
      repository.deleteById.mockResolvedValue(deleteResponse as any);

      const result = await service.remove(productId);

      expect(repository.deleteById).toHaveBeenCalledWith(productId);
      expect(result).toEqual(deleteResponse);
    });

    it('should handle repository errors', async () => {
      const productId = mockProduct._id.toString();
      repository.deleteById.mockRejectedValue(new Error('Delete failed'));

      await expect(service.remove(productId)).rejects.toThrow('Delete failed');
    });
  });

  describe('search', () => {
    it('should search products successfully', async () => {
      const searchDto = ProductFactory.createSearchDto();
      const mockSearchResult = {
        data: ProductFactory.createMany(2),
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      
      repository.search.mockResolvedValue(mockSearchResult as any);
      
      jest.spyOn(HttpResponseUtil, 'processPaginatedResult').mockReturnValue({
        data: mockSearchResult.data.map(p => ({
          id: p._id.toString(),
          name: p.name,
          sku: p.sku,
          price: p.price,
          picture: p.picture,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        })),
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        }
      } as any);

      const result = await service.search(searchDto);

      expect(repository.search).toHaveBeenCalledWith(searchDto);
      expect(HttpResponseUtil.processPaginatedResult).toHaveBeenCalled();
      expect(result.data).toHaveLength(2);
    });
  });

  describe('findManyByIds', () => {
    it('should find products by IDs', async () => {
      const productIds = [mockProduct._id.toString(), ProductFactory.create()._id.toString()];
      const mockProducts = ProductFactory.createMany(2);
      
      repository.findManyByIds.mockResolvedValue(mockProducts);

      const result = await service.findManyByIds(productIds);

      expect(repository.findManyByIds).toHaveBeenCalledWith(productIds);
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('price');
    });

    it('should handle empty array', async () => {
      repository.findManyByIds.mockResolvedValue([]);

      const result = await service.findManyByIds([]);

      expect(result).toEqual([]);
    });
  });

  describe('createWithFile', () => {
    it('should create product with file successfully', async () => {
      const createDto: CreateProductDto = ProductFactory.createDto();
      const mockFile = {
        path: '/uploads/product.jpg',
        filename: 'product.jpg',
      } as Express.Multer.File;
      
      repository.create.mockResolvedValue(mockProduct);

      const result = await service.createWithFile(createDto, mockFile);

      expect(repository.create).toHaveBeenCalledWith({
        ...createDto,
        picture: mockFile.path,
      });
      expect(result).toEqual({
        id: mockProduct._id.toString(),
        name: mockProduct.name,
        sku: mockProduct.sku,
        price: mockProduct.price,
        picture: mockProduct.picture,
        createdAt: mockProduct.createdAt,
        updatedAt: mockProduct.updatedAt,
      });
    });

    it('should throw error when file is missing', async () => {
      const createDto: CreateProductDto = ProductFactory.createDto();

      await expect(service.createWithFile(createDto, null as any)).rejects.toThrow(
        new BadRequestException(ProductMessages.PICTURE_REQUIRED)
      );
    });

    it('should throw error when file is undefined', async () => {
      const createDto: CreateProductDto = ProductFactory.createDto();

      await expect(service.createWithFile(createDto, undefined as any)).rejects.toThrow(
        new BadRequestException(ProductMessages.PICTURE_REQUIRED)
      );
    });
  });

  describe('updateWithFile', () => {
    it('should update product with file successfully', async () => {
      const productId = mockProduct._id.toString();
      const updateDto: UpdateProductDto = ProductFactory.createUpdateDto();
      const mockFile = {
        path: '/uploads/updated-product.jpg',
        filename: 'updated-product.jpg',
      } as Express.Multer.File;
      
      const updatedProduct = { ...mockProduct, ...updateDto, picture: mockFile.path };
      repository.updateById.mockResolvedValue(updatedProduct);

      const result = await service.updateWithFile(productId, updateDto, mockFile);

      expect(repository.updateById).toHaveBeenCalledWith(productId, {
        ...updateDto,
        picture: mockFile.path,
      });
      expect(result.picture).toBe(mockFile.path);
    });

    it('should update product without file', async () => {
      const productId = mockProduct._id.toString();
      const updateDto: UpdateProductDto = ProductFactory.createUpdateDto();
      
      const updatedProduct = { ...mockProduct, ...updateDto };
      repository.updateById.mockResolvedValue(updatedProduct);

      const result = await service.updateWithFile(productId, updateDto);

      expect(repository.updateById).toHaveBeenCalledWith(productId, updateDto);
      expect(result).toEqual({
        id: updatedProduct._id.toString(),
        name: updatedProduct.name,
        sku: updatedProduct.sku,
        price: updatedProduct.price,
        picture: updatedProduct.picture,
        createdAt: updatedProduct.createdAt,
        updatedAt: updatedProduct.updatedAt,
      });
    });
  });

  describe('mapToDto', () => {
    it('should map product to DTO correctly', () => {
      const product = ProductFactory.create();
      
      const result = service['mapToDto'](product);

      expect(result).toEqual({
        id: product._id.toString(),
        name: product.name,
        sku: product.sku,
        price: product.price,
        picture: product.picture,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      });
    });

    it('should handle different ObjectId types', () => {
      const product = ProductFactory.create();
      
      const result = service['mapToDto'](product);

      expect(typeof result.id).toBe('string');
      expect(result.id).toBe(product._id.toString());
    });
  });

  describe('dependency injection', () => {
    it('should inject ProductsRepository', () => {
      expect(service['productsRepository']).toBeDefined();
      expect(service['productsRepository']).toBe(repository);
    });
  });

  describe('error handling', () => {
    it('should propagate repository errors', async () => {
      const error = new Error('Database connection failed');
      repository.findAll.mockRejectedValue(error);

      await expect(service.findAll()).rejects.toThrow('Database connection failed');
    });

    it('should handle invalid input gracefully', async () => {
      repository.create.mockRejectedValue(new BadRequestException('Invalid product data'));

      await expect(service.create({} as any)).rejects.toThrow('Invalid product data');
    });
  });
});