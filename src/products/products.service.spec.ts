import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getModelToken } from '@nestjs/mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { Model } from 'mongoose';
import { NotFoundException } from '@nestjs/common';

const mockProduct = {
  _id: 'someId',
  name: 'Test Product',
  sku: 'TEST-123',
  price: 100,
  picture: '/uploads/test.jpg',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  save: jest.fn().mockResolvedValue(this),
  toObject: function() { return this; },
};

const mockProductModel = {
  findById: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(() => mockProduct),
  exec: jest.fn(),
};

// We need to mock the chainable `exec` method
mockProductModel.findById.mockReturnValue({
  exec: jest.fn().mockResolvedValue(mockProduct),
});
mockProductModel.find.mockReturnValue({
  exec: jest.fn().mockResolvedValue([mockProduct]),
});


describe('ProductsService', () => {
  let service: ProductsService;
  let model: Model<ProductDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getModelToken(Product.name),
          useValue: mockProductModel,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    model = module.get<Model<ProductDocument>>(getModelToken(Product.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should find and return a product by ID', async () => {
      const id = 'someId';
      const result = await service.findOne(id);

      expect(model.findById).toHaveBeenCalledWith(id);
      expect(result.id).toEqual(mockProduct._id);
      expect(result.name).toEqual(mockProduct.name);
    });

    it('should throw NotFoundException if product is not found', async () => {
      mockProductModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne('nonExistentId')).rejects.toThrow('Producto no encontrado');
    });
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const result = await service.findAll();
      expect(model.find).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(1);
      expect(result[0].name).toEqual(mockProduct.name);
    });
  });

  describe('findManyByIds', () => {
    it('should return an array of products for given IDs', async () => {
      const ids = ['someId'];
      const result = await service.findManyByIds(ids);
      expect(model.find).toHaveBeenCalledWith({ _id: { $in: ids } });
      expect(result.length).toBe(1);
      expect(result[0].id).toEqual(mockProduct._id);
    });
  });

  describe('create', () => {
    it('should create and return a new product', async () => {
      const createDto = { name: 'New Product', sku: 'NEW-456', price: 200, picture: 'new.jpg' };

      const createdProduct = {
        ...mockProduct,
        ...createDto,
        toObject: () => ({ ...mockProduct, ...createDto, _id: mockProduct._id }),
      };

      mockProductModel.create.mockResolvedValue(createdProduct as any);

      const result = await service.create(createDto);

      expect(model.create).toHaveBeenCalledWith(createDto);
      expect(result.name).toEqual(createDto.name);
      expect(result.sku).toEqual(createDto.sku);
      expect(result.id).toBeDefined();
    });
  });
});
