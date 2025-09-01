import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { ProductsRepository } from '../../repository/products.repository';
import { Product, ProductDocument } from '../../schemas/product.schema';
import { ProductFactory } from '../../../common/testing';
import { ProductMessages } from '../../enums';
import { SearchProductDto } from '../../dto';

describe('ProductsRepository - Integration Tests', () => {
  let repository: ProductsRepository;
  let productModel: any;

  const createMockQuery = () => ({
    select: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  });

  const mockProductModel = {
    findByIdAndUpdate: jest.fn().mockReturnValue(createMockQuery()),
    findByIdAndDelete: jest.fn().mockReturnValue(createMockQuery()),
    findOne: jest.fn().mockReturnValue(createMockQuery()),
    find: jest.fn().mockReturnValue(createMockQuery()),
    countDocuments: jest.fn().mockReturnValue(createMockQuery()),
    create: jest.fn(),
    save: jest.fn(),
    schema: {
      paths: {
        isActive: true,
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsRepository,
        {
          provide: getModelToken('Product'),
          useValue: mockProductModel,
        },
      ],
    }).compile();

    repository = module.get<ProductsRepository>(ProductsRepository);
    productModel = module.get(getModelToken('Product'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create - detailed scenarios', () => {
    it('should successfully create and save a product', async () => {
      const productData = ProductFactory.createDto();
      const mockProduct = ProductFactory.create(productData);
      const mockProductDocument = {
        ...mockProduct,
        save: jest.fn().mockResolvedValue(mockProduct),
      };

      repository.findByWhereCondition = jest.fn().mockResolvedValue(null);
      
      const MockedModel = jest.fn().mockImplementation(() => mockProductDocument);
      Object.assign(MockedModel, productModel);
      repository['productModel'] = MockedModel as any;

      const result = await repository.create(productData);

      expect(repository.findByWhereCondition).toHaveBeenCalledWith({ sku: productData.sku });
      expect(MockedModel).toHaveBeenCalledWith(productData);
      expect(mockProductDocument.save).toHaveBeenCalled();
      expect(result).toEqual(mockProduct);
    });

    it('should handle product creation with valid data', async () => {
      const productData = {
        name: 'Test Product',
        sku: 'TEST-123',
        price: 99.99,
        picture: 'test-product.jpg',
      };

      repository.findByWhereCondition = jest.fn().mockResolvedValue(null);
      const mockProduct = ProductFactory.create(productData);
      const mockProductDocument = {
        ...mockProduct,
        save: jest.fn().mockResolvedValue(mockProduct),
      };

      const MockedModel = jest.fn().mockImplementation(() => mockProductDocument);
      Object.assign(MockedModel, productModel);
      repository['productModel'] = MockedModel as any;

      const result = await repository.create(productData);

      expect(result).toEqual(mockProduct);
    });
  });

  describe('findAll - implementation details', () => {
    it('should call findByWhereCondition for finding all products', async () => {
      const mockProducts = ProductFactory.createMany(5);
      
      productModel.find().exec.mockResolvedValue(mockProducts);

      const result = await repository.findAll();

      expect(result).toEqual(mockProducts);
    });
  });

  describe('findOneById - edge cases', () => {
    it('should validate ObjectId and throw error for invalid format', async () => {
      const invalidId = 'invalid-id';

      await expect(repository.findOneById(invalidId)).rejects.toThrow(
        'ID de producto inválido'
      );
    });

    it('should find product by valid ObjectId', async () => {
      const productId = ProductFactory.create()._id.toString();
      const mockProduct = ProductFactory.create();

      repository.findByWhereCondition = jest.fn().mockResolvedValue(mockProduct);

      const result = await repository.findOneById(productId);

      expect(repository.findByWhereCondition).toHaveBeenCalledWith({ _id: productId });
      expect(result).toEqual(mockProduct);
    });
  });

  describe('search - comprehensive testing', () => {
    it('should perform search with all filters', async () => {
      const searchDto: SearchProductDto = {
        name: 'Test Product',
        sku: 'TEST-123',
        minPrice: 50,
        maxPrice: 200,
        page: 2,
        limit: 5,
      };

      const mockProducts = ProductFactory.createMany(5);
      const mockResult = {
        data: mockProducts,
        total: 15,
        page: 2,
        limit: 5,
        totalPages: 3,
      };

      productModel.find().exec.mockResolvedValue(mockProducts);
      productModel.countDocuments().exec.mockResolvedValue(15);

      const result = await repository.search(searchDto);

      expect(result.data).toBeDefined();
      expect(result.page).toBe(2);
      expect(result.limit).toBe(5);
    });
  });

  describe('findManyByIds - comprehensive scenarios', () => {
    it('should find multiple products by IDs', async () => {
      const productIds = [
        ProductFactory.create()._id.toString(),
        ProductFactory.create()._id.toString(),
        ProductFactory.create()._id.toString(),
      ];
      const mockProducts = ProductFactory.createMany(3);

      repository.findByWhereCondition = jest.fn().mockResolvedValue(mockProducts);

      const result = await repository.findManyByIds(productIds);

      expect(repository.findByWhereCondition).toHaveBeenCalledWith(
        { _id: { $in: productIds } },
        { multiple: true }
      );
      expect(result).toEqual(mockProducts);
    });

    it('should validate that all products are found', async () => {
      const productIds = ['id1', 'id2', 'id3'];
      const mockProducts = ProductFactory.createMany(2); // Missing one product

      repository.findByWhereCondition = jest.fn().mockResolvedValue(mockProducts);

      await expect(repository.findManyByIds(productIds)).rejects.toThrow(
        new NotFoundException('Algunos productos no fueron encontrados')
      );
    });
  });

  describe('updateById - comprehensive scenarios', () => {
    it('should update product with valid data', async () => {
      const productId = ProductFactory.create()._id.toString();
      const updateData = { name: 'Updated Product', price: 199.99 };
      const updatedProduct = ProductFactory.create({ ...updateData });

      productModel.findOne().exec.mockResolvedValue(updatedProduct);
      productModel.findByIdAndUpdate().exec.mockResolvedValue(updatedProduct);

      const result = await repository.updateById(productId, updateData);

      expect(productModel.findByIdAndUpdate).toHaveBeenCalledWith(productId, updateData, { new: true });
      expect(result).toEqual(updatedProduct);
    });

    it('should validate update data before updating', async () => {
      const productId = ProductFactory.create()._id.toString();
      const invalidUpdateData = { price: -100 };

      await expect(repository.updateById(productId, invalidUpdateData)).rejects.toThrow(
        new BadRequestException(ProductMessages.INVALID_PRICE)
      );
    });
  });

  describe('deleteById - comprehensive scenarios', () => {
    it('should soft delete product successfully', async () => {
      const productId = ProductFactory.create()._id.toString();
      const mockProduct = ProductFactory.create();

      productModel.findOne().exec.mockResolvedValue(mockProduct);
      productModel.findByIdAndUpdate().exec.mockResolvedValue({ ...mockProduct, isActive: false });

      const result = await repository.deleteById(productId);

      expect(productModel.findByIdAndUpdate).toHaveBeenCalledWith(
        productId,
        { isActive: false },
        { new: true }
      );
      expect(result).toEqual({ message: ProductMessages.DELETED_SUCCESS });
    });
  });

  describe('validation scenarios', () => {
    it('should validate required fields for creation', async () => {
      const invalidData = {
        name: '',
        sku: '',
        price: undefined,
      };

      repository.findByWhereCondition = jest.fn().mockResolvedValue(null);

      await expect(repository.create(invalidData)).rejects.toThrow(
        new BadRequestException(ProductMessages.NAME_REQUIRED)
      );
    });

    it('should validate SKU uniqueness', async () => {
      const productData = ProductFactory.createDto();
      const existingProduct = ProductFactory.create({ sku: productData.sku });

      repository.findByWhereCondition = jest.fn().mockResolvedValue(existingProduct);

      await expect(repository.create(productData)).rejects.toThrow(
        new BadRequestException(ProductMessages.ALREADY_EXISTS)
      );
    });

    it('should validate price is positive', async () => {
      const invalidData = {
        name: 'Test Product',
        sku: 'TEST-123',
        price: -10,
      };

      repository.findByWhereCondition = jest.fn().mockResolvedValue(null);

      await expect(repository.create(invalidData)).rejects.toThrow(
        new BadRequestException(ProductMessages.INVALID_PRICE)
      );
    });

    it('should validate SKU format', async () => {
      const invalidData = {
        name: 'Test Product',
        sku: 'invalid_sku',
        price: 100,
      };

      repository.findByWhereCondition = jest.fn().mockResolvedValue(null);

      await expect(repository.create(invalidData)).rejects.toThrow(
        new BadRequestException(ProductMessages.INVALID_SKU)
      );
    });
  });

  describe('Error handling scenarios', () => {
    it('should handle database errors gracefully', async () => {
      const productData = ProductFactory.createDto();
      
      repository.findByWhereCondition = jest.fn().mockRejectedValue(new Error('Database error'));

      await expect(repository.create(productData)).rejects.toThrow('Database error');
    });
  });
});