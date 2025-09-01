import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrdersRepository } from '../../repository/orders.repository';
import { Order, OrderDocument } from '../../schemas/order.schema';
import { ProductsService } from '../../../products/services/products.service';
import { OrderFactory } from '../../../common/testing';
import { OrderMessages } from '../../enums';
import { SearchOrderDto } from '../../dto';

describe('OrdersRepository', () => {
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

  const mockOrderModel = {
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

  describe('create', () => {
    it('should create an order successfully', async () => {
      const orderData = OrderFactory.createDto();
      const mockOrder = OrderFactory.create();
      const mockOrderDocument = {
        ...mockOrder,
        save: jest.fn().mockResolvedValue(mockOrder),
      };

      // Mock products validation and calculation with the correct structure
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

    it('should validate order data before creating', async () => {
      const invalidOrderData = {
        clientId: '',
        clientName: '',
        products: [],
      };

      await expect(repository.create(invalidOrderData as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all orders', async () => {
      const mockOrders = OrderFactory.createMany(3);
      
      orderModel.find().exec.mockResolvedValue(mockOrders);

      const result = await repository.findAll();

      expect(result).toEqual(mockOrders);
    });
  });

  describe('findOneById', () => {
    it('should find order by valid ID', async () => {
      const orderId = OrderFactory.create()._id.toString();
      const mockOrder = OrderFactory.create();

      repository.findByWhereCondition = jest.fn().mockResolvedValue(mockOrder);

      const result = await repository.findOneById(orderId);

      expect(repository.findByWhereCondition).toHaveBeenCalledWith({ _id: orderId });
      expect(result).toEqual(mockOrder);
    });

    it('should throw error for invalid ID format', async () => {
      const invalidId = 'invalid-id';

      await expect(repository.findOneById(invalidId)).rejects.toThrow(
        'ID de orden inválido'
      );
    });

    it('should throw error when order not found', async () => {
      const orderId = OrderFactory.create()._id.toString();

      repository.findByWhereCondition = jest.fn().mockResolvedValue(null);

      await expect(repository.findOneById(orderId)).rejects.toThrow(
        new NotFoundException(OrderMessages.NOT_FOUND)
      );
    });
  });

  describe('search', () => {
    it('should search orders successfully', async () => {
      const searchDto: SearchOrderDto = {
        clientName: 'Test',
        status: 'pending',
        minTotal: 100,
        maxTotal: 500,
        page: 1,
        limit: 10,
      };

      const mockOrders = OrderFactory.createMany(2);
      const mockResult = {
        data: mockOrders,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      orderModel.find().exec.mockResolvedValue(mockOrders);
      orderModel.countDocuments().exec.mockResolvedValue(2);

      const result = await repository.search(searchDto);

      expect(result.data).toBeDefined();
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });

  describe('updateById', () => {
    it('should update order successfully', async () => {
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
  });

  describe('deleteById', () => {
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

  describe('findByWhereCondition', () => {
    it('should find orders with condition', async () => {
      const condition = { clientName: 'Test Client' };
      const mockOrders = OrderFactory.createMany(1);

      orderModel.findOne().exec.mockResolvedValue(mockOrders[0]);

      const result = await repository.findByWhereCondition(condition);

      expect(result).toBeDefined();
    });

    it('should handle multiple orders', async () => {
      const condition = { status: 'pending' };
      const options = { multiple: true };
      const mockOrders = OrderFactory.createMany(3);

      orderModel.find().exec.mockResolvedValue(mockOrders);

      const result = await repository.findByWhereCondition(condition, options);

      expect(result).toEqual(mockOrders);
    });
  });

  describe('error handling', () => {
    it('should handle database errors gracefully', async () => {
      const orderData = OrderFactory.createDto();
      
      productsService.findManyByIds.mockRejectedValue(new Error('Database error'));

      await expect(repository.create(orderData)).rejects.toThrow('Database error');
    });
  });
});