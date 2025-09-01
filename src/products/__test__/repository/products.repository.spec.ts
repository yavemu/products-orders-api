import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ProductsRepository } from '../../repository/products.repository';
import { Product, ProductDocument } from '../../schemas/product.schema';
import { ProductFactory } from '../../../common/testing';
import { ProductMessages } from '../../enums';
import { SearchProductDto } from '../../dto';

describe('ProductsRepository', () => {
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

  describe('create', () => {
    it('should create a product successfully', async () => {
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

    it('should throw error if product with same SKU exists', async () => {
      const productData = ProductFactory.createDto();
      const existingProduct = ProductFactory.create();

      repository.findByWhereCondition = jest.fn().mockResolvedValue(existingProduct);

      await expect(repository.create(productData)).rejects.toThrow(
        new BadRequestException(ProductMessages.ALREADY_EXISTS)
      );
    });

    it('should validate product data before creating', async () => {
      const invalidProductData = {
        name: '',
        sku: 'INVALID_SKU',
        price: -10,
      };

      await expect(repository.create(invalidProductData)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      const mockProducts = ProductFactory.createMany(3);
      
      productModel.find().exec.mockResolvedValue(mockProducts);

      const result = await repository.findAll();

      expect(result).toEqual(mockProducts);
    });
  });

  describe('findOneById', () => {
    it('should find product by valid ID', async () => {
      const productId = ProductFactory.create()._id.toString();
      const mockProduct = ProductFactory.create();

      repository.findByWhereCondition = jest.fn().mockResolvedValue(mockProduct);

      const result = await repository.findOneById(productId);

      expect(repository.findByWhereCondition).toHaveBeenCalledWith({ _id: productId });
      expect(result).toEqual(mockProduct);
    });

    it('should throw error for invalid ID format', async () => {
      const invalidId = 'invalid-id';

      await expect(repository.findOneById(invalidId)).rejects.toThrow(
        'ID de producto inválido'
      );
    });

    it('should throw error when product not found', async () => {
      const productId = ProductFactory.create()._id.toString();

      repository.findByWhereCondition = jest.fn().mockResolvedValue(null);

      await expect(repository.findOneById(productId)).rejects.toThrow(
        new NotFoundException(ProductMessages.NOT_FOUND)
      );
    });
  });

  describe('search', () => {
    it('should search products successfully', async () => {
      const searchDto: SearchProductDto = {
        name: 'Test',
        minPrice: 100,
        maxPrice: 500,
        page: 1,
        limit: 10,
      };

      const mockProducts = ProductFactory.createMany(2);
      const mockResult = {
        data: mockProducts,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      productModel.find().exec.mockResolvedValue(mockProducts);
      productModel.countDocuments().exec.mockResolvedValue(2);

      const result = await repository.search(searchDto);

      expect(result.data).toBeDefined();
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });

  describe('findManyByIds', () => {
    it('should find products by IDs successfully', async () => {
      const productIds = [
        ProductFactory.create()._id.toString(),
        ProductFactory.create()._id.toString(),
      ];
      const mockProducts = ProductFactory.createMany(2);

      repository.findByWhereCondition = jest.fn().mockResolvedValue(mockProducts);

      const result = await repository.findManyByIds(productIds);

      expect(repository.findByWhereCondition).toHaveBeenCalledWith(
        { _id: { $in: productIds } },
        { multiple: true }
      );
      expect(result).toEqual(mockProducts);
    });

    it('should throw error for empty IDs array', async () => {
      await expect(repository.findManyByIds([])).rejects.toThrow(
        new BadRequestException(ProductMessages.INVALID_PRODUCTS)
      );
    });

    it('should throw error for null/undefined IDs', async () => {
      await expect(repository.findManyByIds(null as any)).rejects.toThrow(
        new BadRequestException(ProductMessages.INVALID_PRODUCTS)
      );

      await expect(repository.findManyByIds(undefined as any)).rejects.toThrow(
        new BadRequestException(ProductMessages.INVALID_PRODUCTS)
      );
    });

    it('should throw error when not all products are found', async () => {
      const productIds = ['id1', 'id2', 'id3'];
      const mockProducts = ProductFactory.createMany(2); // Only 2 products found

      repository.findByWhereCondition = jest.fn().mockResolvedValue(mockProducts);

      await expect(repository.findManyByIds(productIds)).rejects.toThrow(
        new NotFoundException('Algunos productos no fueron encontrados')
      );
    });
  });

  describe('updateById', () => {
    it('should update product successfully', async () => {
      const productId = ProductFactory.create()._id.toString();
      const updateData = { name: 'Updated Product', price: 199.99 };
      const updatedProduct = ProductFactory.create({ ...updateData });

      productModel.findOne().exec.mockResolvedValue(updatedProduct);
      productModel.findByIdAndUpdate().exec.mockResolvedValue(updatedProduct);

      const result = await repository.updateById(productId, updateData);

      expect(productModel.findByIdAndUpdate).toHaveBeenCalledWith(productId, updateData, { new: true });
      expect(result).toEqual(updatedProduct);
    });

    it('should validate update data', async () => {
      const productId = ProductFactory.create()._id.toString();
      const invalidUpdateData = { price: -100 };

      await expect(repository.updateById(productId, invalidUpdateData)).rejects.toThrow(
        new BadRequestException(ProductMessages.INVALID_PRICE)
      );
    });
  });

  describe('deleteById', () => {
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

  describe('validateProductData', () => {
    it('should validate required fields for creation', () => {
      const invalidData = { name: '', sku: '', price: undefined };

      expect(() => repository['validateProductData'](invalidData, false)).toThrow(
        new BadRequestException(ProductMessages.NAME_REQUIRED)
      );
    });

    it('should validate price is positive', () => {
      const invalidData = { name: 'Test', sku: 'TEST-123', price: -10 };

      expect(() => repository['validateProductData'](invalidData, false)).toThrow(
        new BadRequestException(ProductMessages.INVALID_PRICE)
      );
    });

    it('should validate SKU format', () => {
      const invalidData = { name: 'Test', sku: 'invalid_sku', price: 100 };

      expect(() => repository['validateProductData'](invalidData, false)).toThrow(
        new BadRequestException(ProductMessages.INVALID_SKU)
      );
    });

    it('should allow partial validation for updates', () => {
      const updateData = { price: 150 };

      expect(() => repository['validateProductData'](updateData, true)).not.toThrow();
    });
  });

  describe('isValidSku', () => {
    it('should validate correct SKU format', () => {
      expect(repository['isValidSku']('TEST-123')).toBe(true);
      expect(repository['isValidSku']('PRODUCT-456')).toBe(true);
      expect(repository['isValidSku']('ABC123')).toBe(true);
    });

    it('should reject invalid SKU format', () => {
      expect(repository['isValidSku']('test-123')).toBe(false); // lowercase
      expect(repository['isValidSku']('TEST_123')).toBe(false); // underscore
      expect(repository['isValidSku']('TE')).toBe(false); // too short
      expect(repository['isValidSku']('A'.repeat(51))).toBe(false); // too long
    });
  });

  describe('findByWhereCondition', () => {
    it('should find products with condition', async () => {
      const condition = { name: 'Test Product' };
      const mockProducts = ProductFactory.createMany(1);

      productModel.findOne().exec.mockResolvedValue(mockProducts[0]);

      const result = await repository.findByWhereCondition(condition);

      expect(result).toBeDefined();
    });

    it('should handle multiple products', async () => {
      const condition = { isActive: true };
      const options = { multiple: true };
      const mockProducts = ProductFactory.createMany(3);

      productModel.find().exec.mockResolvedValue(mockProducts);

      const result = await repository.findByWhereCondition(condition, options);

      expect(result).toEqual(mockProducts);
    });
  });

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      const productData = ProductFactory.createDto();
      
      repository.findByWhereCondition = jest.fn().mockRejectedValue(new Error('Database error'));

      await expect(repository.create(productData)).rejects.toThrow('Database error');
    });
  });
});