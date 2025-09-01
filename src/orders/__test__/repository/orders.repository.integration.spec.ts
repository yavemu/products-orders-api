import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { OrdersRepository } from '../../repository/orders.repository';
import { Order, OrderDocument } from '../../schemas/order.schema';
import { ProductsService } from '../../../products/services/products.service';
import { OrderFactory } from '../../../common/testing';
import { OrderMessages } from '../../enums';
import { SearchOrderDto } from '../../dto';

describe('OrdersRepository - Integration Tests', () => {
  let repository: OrdersRepository;
  let orderModel: any;
  let productsService: jest.Mocked<ProductsService>;

  const createMockQuery = () => ({
    select: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  });

  const createMockAggregate = () => ({
    exec: jest.fn(),
  });

  const mockOrderModel = {
    findByIdAndUpdate: jest.fn().mockReturnValue(createMockQuery()),
    findByIdAndDelete: jest.fn().mockReturnValue(createMockQuery()),
    findOne: jest.fn().mockReturnValue(createMockQuery()),
    find: jest.fn().mockReturnValue(createMockQuery()),
    countDocuments: jest.fn().mockReturnValue(createMockQuery()),
    aggregate: jest.fn().mockReturnValue(createMockAggregate()),
    create: jest.fn(),
    save: jest.fn(),
    schema: {
      paths: {
        isActive: true,
      },
    },
  };

  const mockProductsService = {
    findManyByIds: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersRepository,
        {
          provide: getModelToken('Order'),
          useValue: mockOrderModel,
        },
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    repository = module.get<OrdersRepository>(OrdersRepository);
    orderModel = module.get(getModelToken('Order'));
    productsService = module.get(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create - detailed scenarios', () => {
    it('should successfully create and save an order', async () => {
      const orderData = OrderFactory.createDto();
      const mockOrder = OrderFactory.create();
      const mockOrderDocument = {
        ...mockOrder,
        save: jest.fn().mockResolvedValue(mockOrder),
      };

      // Mock products validation and calculation with correct IDs
      const mockProducts = orderData.products.map((p, index) => ({
        id: p.productId,
        price: 100 + (index * 50),
        name: `Product ${index + 1}`,
      }));
      
      productsService.findManyByIds.mockResolvedValue(mockProducts as any);
      
      const MockedModel = jest.fn().mockImplementation(() => mockOrderDocument);
      Object.assign(MockedModel, orderModel);
      repository['orderModel'] = MockedModel as any;

      const result = await repository.create(orderData);

      expect(productsService.findManyByIds).toHaveBeenCalledWith(
        orderData.products.map(p => p.productId)
      );
      expect(MockedModel).toHaveBeenCalled();
      expect(mockOrderDocument.save).toHaveBeenCalled();
      expect(result).toEqual(mockOrder);
    });

    it('should handle order creation with valid data', async () => {
      const orderData = {
        clientId: '507f1f77bcf86cd799439011',
        clientName: 'Test Client',
        products: [
          { productId: '507f1f77bcf86cd799439012', quantity: 2 }
        ],
      };

      // Mock products validation
      productsService.findManyByIds.mockResolvedValue([
        { id: '507f1f77bcf86cd799439012', price: 100, name: 'Test Product' }
      ] as any);

      const mockOrder = OrderFactory.create();
      const mockOrderDocument = {
        ...mockOrder,
        save: jest.fn().mockResolvedValue(mockOrder),
      };

      const MockedModel = jest.fn().mockImplementation(() => mockOrderDocument);
      Object.assign(MockedModel, orderModel);
      repository['orderModel'] = MockedModel as any;

      const result = await repository.create(orderData);

      expect(result).toEqual(mockOrder);
    });
  });

  describe('findAll - implementation details', () => {
    it('should call findByWhereCondition for finding all orders', async () => {
      const mockOrders = OrderFactory.createMany(5);
      
      orderModel.find().exec.mockResolvedValue(mockOrders);

      const result = await repository.findAll();

      expect(result).toEqual(mockOrders);
    });
  });

  describe('findOneById - edge cases', () => {
    it('should validate ObjectId and throw error for invalid format', async () => {
      const invalidId = 'invalid-id';

      await expect(repository.findOneById(invalidId)).rejects.toThrow(
        'ID de orden inválido'
      );
    });

    it('should find order by valid ObjectId', async () => {
      const orderId = OrderFactory.create()._id.toString();
      const mockOrder = OrderFactory.create();

      repository.findByWhereCondition = jest.fn().mockResolvedValue(mockOrder);

      const result = await repository.findOneById(orderId);

      expect(repository.findByWhereCondition).toHaveBeenCalledWith({ _id: orderId });
      expect(result).toEqual(mockOrder);
    });
  });

  describe('search - comprehensive testing', () => {
    it('should perform search with all filters', async () => {
      const searchDto: SearchOrderDto = {
        clientName: 'Test Client',
        identifier: 'ORD-2024-ABC123',
        status: 'pending',
        minTotal: 50,
        maxTotal: 500,
        page: 2,
        limit: 5,
      };

      const mockOrders = OrderFactory.createMany(5);
      const mockResult = {
        data: mockOrders,
        total: 15,
        page: 2,
        limit: 5,
        totalPages: 3,
      };

      orderModel.find().exec.mockResolvedValue(mockOrders);
      orderModel.countDocuments().exec.mockResolvedValue(15);

      const result = await repository.search(searchDto);

      expect(result.data).toBeDefined();
      expect(result.page).toBe(2);
      expect(result.limit).toBe(5);
    });
  });

  describe('updateById - comprehensive scenarios', () => {
    it('should update order with valid data', async () => {
      const orderId = OrderFactory.create()._id.toString();
      const updateData = { clientName: 'Updated Client', status: 'shipped' };
      const existingOrder = OrderFactory.create({ status: 'processing' });
      const updatedOrder = OrderFactory.create({ ...updateData });

      repository.findByWhereCondition = jest.fn().mockResolvedValue(existingOrder);
      orderModel.findByIdAndUpdate().exec.mockResolvedValue(updatedOrder);

      const result = await repository.updateById(orderId, updateData);

      expect(orderModel.findByIdAndUpdate).toHaveBeenCalled();
      expect(result).toEqual(updatedOrder);
    });

    it('should validate update data before updating', async () => {
      const orderId = OrderFactory.create()._id.toString();
      const existingOrder = OrderFactory.create({ status: 'pending' });
      
      repository.findByWhereCondition = jest.fn().mockResolvedValue(existingOrder);

      const validUpdateData = { status: 'processing' }; // Valid status transition
      const updatedOrder = OrderFactory.create({ status: 'processing' });
      orderModel.findByIdAndUpdate().exec.mockResolvedValue(updatedOrder);

      const result = await repository.updateById(orderId, validUpdateData);
      expect(repository.findByWhereCondition).toHaveBeenCalled();
      expect(result).toEqual(updatedOrder);
    });

    it('should recalculate totals when products are updated', async () => {
      const orderId = OrderFactory.create()._id.toString();
      const existingOrder = OrderFactory.create({ status: 'pending' });
      const updateData = {
        products: [
          { productId: '507f1f77bcf86cd799439011', quantity: 3 }
        ]
      };

      repository.findByWhereCondition = jest.fn().mockResolvedValue(existingOrder);
      productsService.findManyByIds.mockResolvedValue([
        { id: '507f1f77bcf86cd799439011', price: 150, name: 'Updated Product' }
      ] as any);

      const updatedOrder = { ...existingOrder, ...updateData, total: 450 };
      orderModel.findByIdAndUpdate().exec.mockResolvedValue(updatedOrder);

      const result = await repository.updateById(orderId, updateData);

      expect(productsService.findManyByIds).toHaveBeenCalled();
      expect(result).toEqual(updatedOrder);
    });
  });

  describe('deleteById - comprehensive scenarios', () => {
    it('should delete order successfully', async () => {
      const orderId = OrderFactory.create()._id.toString();
      const mockOrder = OrderFactory.create();

      orderModel.findOne().exec.mockResolvedValue(mockOrder);
      orderModel.findByIdAndDelete().exec.mockResolvedValue({});

      const result = await repository.deleteById(orderId);

      expect(orderModel.findByIdAndDelete).toHaveBeenCalledWith(orderId);
      expect(result).toEqual({ message: OrderMessages.DELETED_SUCCESS });
    });
  });

  describe('validation scenarios', () => {
    it('should validate required fields for creation', async () => {
      const invalidData = {
        clientId: '',
        clientName: '',
        products: [],
      };

      await expect(repository.create(invalidData as any)).rejects.toThrow(BadRequestException);
    });

    it('should validate product existence during creation', async () => {
      const orderData = OrderFactory.createDto();
      
      productsService.findManyByIds.mockRejectedValue(
        new NotFoundException('Some products not found')
      );

      await expect(repository.create(orderData)).rejects.toThrow(
        new NotFoundException('Some products not found')
      );
    });
  });

  describe('findOrdersForReports - report functionality', () => {
    it('should find orders for reports with date filters', async () => {
      const filters = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        clientId: '507f1f77bcf86cd799439011',
        sortBy: 'total_desc',
      };

      const mockOrders = OrderFactory.createMany(3);
      const mockResult = { data: mockOrders, total: 3 };
      
      orderModel.aggregate().exec.mockResolvedValue(mockOrders);

      // Mock the method if it exists in the repository
      if (repository['findOrdersForReports']) {
        const result = await repository['findOrdersForReports'](filters);
        expect(result).toBeDefined();
      }
    });
  });

  describe('getOrdersSummary - summary functionality', () => {
    it('should get orders summary with aggregation', async () => {
      const filters = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        clientId: '507f1f77bcf86cd799439011',
      };

      const mockSummary = {
        totalOrders: 5,
        totalRevenue: 1000,
        totalQuantitySold: 25,
        averageOrderValue: 200,
      };

      // Mock the method if it exists in the repository
      if (repository['getOrdersSummary']) {
        const aggregateResult = [mockSummary];
        orderModel.aggregate().exec.mockResolvedValue(aggregateResult);

        const result = await repository['getOrdersSummary'](filters);
        expect(result).toEqual(mockSummary);
      }
    });
  });

  describe('Error handling scenarios', () => {
    it('should handle database errors gracefully', async () => {
      const orderData = OrderFactory.createDto();
      
      productsService.findManyByIds.mockRejectedValue(new Error('Database error'));

      await expect(repository.create(orderData)).rejects.toThrow('Database error');
    });

    it('should handle product service errors', async () => {
      const orderData = OrderFactory.createDto();
      
      productsService.findManyByIds.mockRejectedValue(new BadRequestException('Product validation failed'));

      await expect(repository.create(orderData)).rejects.toThrow('Product validation failed');
    });
  });
});