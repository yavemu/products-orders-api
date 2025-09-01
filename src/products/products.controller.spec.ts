import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BadRequestException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';

const mockProductsService = {
  create: jest.fn(),
  findOne: jest.fn(),
  findAll: jest.fn(),
};

const mockProduct: ProductResponseDto = {
  id: 'someId',
  name: 'Test Product',
  sku: 'TEST-123',
  price: 100,
  picture: '/uploads/test.jpg',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockFile: Express.Multer.File = {
  fieldname: 'picture',
  originalname: 'test.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  size: 1024,
  destination: 'uploads/',
  filename: 'test.jpg',
  path: '/uploads/test.jpg',
  buffer: Buffer.from('test'),
  stream: null,
};

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .useValue({ intercept: jest.fn((context, next) => next.handle()) })
      .compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a product successfully', async () => {
      const createDto: CreateProductDto = {
        name: 'Test Product',
        sku: 'TEST-123',
        price: 100,
      };

      mockProductsService.create.mockResolvedValue(mockProduct);

      const result = await controller.create(mockFile, createDto);

      expect(service.create).toHaveBeenCalledWith({
        ...createDto,
        picture: mockFile.path,
      });
      expect(result).toEqual(mockProduct);
    });

    it('should throw BadRequestException when no file is provided', async () => {
      const createDto: CreateProductDto = {
        name: 'Test Product',
        sku: 'TEST-123',
        price: 100,
      };

      await expect(controller.create(null, createDto)).rejects.toThrow(BadRequestException);
      await expect(controller.create(null, createDto)).rejects.toThrow(
        'Product picture is required',
      );
    });
  });

  describe('findOne', () => {
    it('should return a product by ID', async () => {
      const id = 'someId';
      mockProductsService.findOne.mockResolvedValue(mockProduct);

      const result = await controller.findOne(id);

      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockProduct);
    });
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      const products = [mockProduct];
      mockProductsService.findAll.mockResolvedValue(products);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(products);
    });
  });
});
